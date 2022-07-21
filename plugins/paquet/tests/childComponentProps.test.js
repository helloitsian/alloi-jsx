const AlloiJSX = require("../index.js");

const code = `
  const ChildComponent = ({ literal }) => <h1>{ literal }</h1>;
  const Component = () => {
    const id = "__el1";
    return <div>
      <ChildComponent id={id} literal="literal" number={2} />
    </div>;
  }
`

const compiler = new AlloiJSX();
const compiled = compiler.parseJsx(code);

console.log(compiled);