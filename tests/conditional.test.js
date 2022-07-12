const LiquidJsx = require("../index.js");

const code = `const Component = () => {
  const count = 0;
  return <div>
    { count > 0 ? <h1>Hello World</h1> : <h2>Hello World</h2> }
  </div>;
}`

const compiler = new LiquidJsx();
const compiled = compiler.parseJsx(code);

console.log(compiled);