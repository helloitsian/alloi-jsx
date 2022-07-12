const LiquidJsx = require("../index.js");

const code = `const Component = () => {
  const id = "__el0";
  return <div literal="literal" jsxProp={id} >
    <h1>Hello World</h1>
  </div>;
}`

const compiler = new LiquidJsx();
const compiled = compiler.parseJsx(code);

console.log(compiled);