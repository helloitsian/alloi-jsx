const LiquidJsx = require("../index.js");

const code = `
  const Component = ({ children }) => {
    return (
      <div style="color: red;">
        { ...children }
      </div>
    );
  }

  const UsingComponent = () => {
    return (
      <Component>
        <h1>Hello World</h1>
      </Component>
    )
  }
`;

const compiler = new LiquidJsx();
const compiled = compiler.parseJsx(code);

console.log(compiled);
