const {relative} = require('path');

module.exports = babel => {
  const {types: t} = babel;

  const getName = path => {
    if (t.isFunctionDeclaration(path.node)) {
      return path.node.id.name;
    }

    const parent = path.parent;

    if (t.isExportDefaultDeclaration(parent)) {
      return 'default';
    } else if (t.isVariableDeclarator(parent)) {
      return parent.id.name;
    }
  };

  const assignDisplayName = (path, state) => {
    const name = getName(path) ?? 'Unknown Location';
    const filename =
      state.filename != null
        ? relative(process.cwd(), state.filename)
        : 'unknown file';

    const identifier = `${name} (${filename})`;

    if (t.isFunctionDeclaration(path)) {
      path.insertAfter(
        t.assignmentExpression(
          '=',
          t.memberExpression(
            t.identifier(path.node.id.name),
            t.identifier('displayName'),
          ),
          t.stringLiteral(identifier),
        ),
      );
    } else {
      path.replaceWith(
        t.callExpression(
          t.memberExpression(t.identifier('Object'), t.identifier('assign')),
          [
            path.node,
            t.objectExpression([
              t.objectProperty(
                t.identifier('displayName'),
                t.stringLiteral(identifier),
              ),
            ]),
          ],
        ),
      );
    }
  };

  const functionsContainingJsx = new Set();

  const queueParentFunction = path => {
    const fn = path.getFunctionParent();
    if (fn != null) {
      functionsContainingJsx.add(fn);
    }
  };

  return {
    visitor: {
      Program: {
        exit(_, state) {
          Array.from(functionsContainingJsx)
            .filter(path => {
              // Don't add `displayName` to callbacks of things like like .map
              return path.getFunctionParent() == null;
            })
            .forEach(path => {
              assignDisplayName(path, state);
            });
        },
      },
      JSXElement: queueParentFunction,
      JSXFragment: queueParentFunction,
    },
  };
};
