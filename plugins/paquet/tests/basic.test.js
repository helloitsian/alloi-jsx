const AlloiJSX = require("../index.js");

const code = `() => {
  return <div></div>;
}`

const compiler = new AlloiJSX();
const compiled = compiler.parseJsx(code);

console.log(compiled);