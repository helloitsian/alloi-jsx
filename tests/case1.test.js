

const LiquidJsx = require("../index.js");

const code = `
  const Component = () => {
    const [count, setCount] = useAtomic(0);

    return (
      <div>
        <h1>{count}</h1>
        <button onClick={() => setCount(count + 1)}>Click me!</button>
      </div>
    )
  }
`

const compiler = new LiquidJsx();
const compiled = compiler.parseJsx(code);

console.log(compiled);