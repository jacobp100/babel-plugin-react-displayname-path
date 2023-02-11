const path = require('path');
const babel = require('@babel/core');

const transform = code =>
  babel.transformSync(code, {
    filename: path.resolve('example.js'),
    plugins: [require('@babel/plugin-syntax-jsx'), require('./index.js')],
    configFile: false,
  }).code;

test('arrow function', () => {
  expect(
    transform(`
      const Example = ({value}) => {
        return (
          <div>{value}</div>
        )
      }
    `),
  ).toMatchInlineSnapshot(`
    "const Example = Object.assign(({
      value
    }) => {
      return <div>{value}</div>;
    }, {
      displayName: "Example (example.js)"
    });"
  `);

  expect(
    transform(`
      const Example = ({value}) => (
        <div>{value}</div>
      );
    `),
  ).toMatchInlineSnapshot(`
    "const Example = Object.assign(({
      value
    }) => <div>{value}</div>, {
      displayName: "Example (example.js)"
    });"
  `);
});

test('function declaration', () => {
  expect(
    transform(`
      function Example({value}) {
        return (
          <div>{value}</div>
        )
      }
    `),
  ).toMatchInlineSnapshot(`
    "function Example({
      value
    }) {
      return <div>{value}</div>;
    }
    Example.displayName = "Example (example.js)""
  `);
});

test('export default anonymous arrow function', () => {
  expect(
    transform(`
      export default ({value}) => {
        return (
          <div>{value}</div>
        )
      }
    `),
  ).toMatchInlineSnapshot(`
    "export default Object.assign(({
      value
    }) => {
      return <div>{value}</div>;
    }, {
      displayName: "default (example.js)"
    });"
  `);
});

test('map function in react component', () => {
  expect(
    transform(`
      function Example({values}) {
        return (
          <>
            {values.map(value => (
              <div key={value}>{value}</div>
            ))}
          </>
        );
      }

      const Other = ({values}) => {
        return (
          <>
            {values.map(value => (
              <div key={value}>{value}</div>
            ))}
          </>
        );
      }
    `),
  ).toMatchInlineSnapshot(`
    "function Example({
      values
    }) {
      return <>
                {values.map(value => <div key={value}>{value}</div>)}
              </>;
    }
    Example.displayName = "Example (example.js)"
    const Other = Object.assign(({
      values
    }) => {
      return <>
                {values.map(value => <div key={value}>{value}</div>)}
              </>;
    }, {
      displayName: "Other (example.js)"
    });"
  `);
});

test('non-react components', () => {
  expect(
    transform(`
      function Example1() {
        return null;
      }

      const Example2 = () => {
        return null;
      }

      const Example3 = () => null;
    `),
  ).toMatchInlineSnapshot(`
    "function Example1() {
      return null;
    }
    const Example2 = () => {
      return null;
    };
    const Example3 = () => null;"
  `);
});
