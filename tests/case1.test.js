const fs = require('fs');
const LiquidJsx = require("../index.js");

const code = `
import { useAtomic, render } from "alloi";

const Component = () => {
  const [count, setCount] = useAtomic(0);

  return (
    <div>
      <h1>{count}</h1>
      <button onClick={() => setCount(count() + 1)}>Click me!</button>
    </div>
  )
}

// render the component
const root = document.querySelector("#app")
render(root, <Component />);

export default Component;
`

const compiler = new LiquidJsx();
const compiled = compiler.parseJsx(code, __dirname + "/case1.test.js");

fs.writeFileSync(__dirname + "/out/case1.test.out.js", compiled);