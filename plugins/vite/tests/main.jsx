import { useAtomic, render } from "alloi";

const Component = () => {
  const [count, setCount] = useAtomic(0);
  const [text] = useAtomic("Hello World");

  const handleClick = () => {
    setCount(count() + 1);
  }

  return (
    <div>
      <h1>{text}</h1>
      <h2>{count}</h2>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
}

render(document.getElementById("app"), <Component/>);

