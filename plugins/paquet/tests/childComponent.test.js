const AlloiJSX = require("../index.js");

const code = `
  const ChildComponent = () => <h1>Hello World</h1>;
  const Component = () => {
    return <div>
      <ChildComponent />
    </div>;
  }
`

const compiler = new AlloiJSX();
const compiled = compiler.parseJsx(code);

console.log(compiled);