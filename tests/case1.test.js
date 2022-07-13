const fs = require('fs');
const LiquidJsx = require("../index.js");

const code = `
  const Component = () => {
    const [count, setCount] = AlloiReactive.useAtomic(0);

    return (
      <div>
        <h1>{count}</h1>
        <button onClick={() => setCount(count() + 1)}>Click me!</button>
      </div>
    )
  }
`

const compiler = new LiquidJsx();
const compiled = compiler.parseJsx(code);

fs.writeFileSync(__dirname + "/out/case1.test.out.js", compiled);