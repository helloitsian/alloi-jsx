const LiquidJsx = require("../index.js");

const code = `() => {
  return <div></div>;
}`

const compiler = new LiquidJsx();
const compiled = compiler.parseJsx(code);

console.log(compiled);