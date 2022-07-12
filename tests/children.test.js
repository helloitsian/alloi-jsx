const LiquidJsx = require("../index.js");

const code = `const Component = () => {
  return <div>
    <h1>Hello World</h1>
  </div>;
}`

const compiler = new LiquidJsx();
const compiled = compiler.parseJsx(code);

console.log(compiled);