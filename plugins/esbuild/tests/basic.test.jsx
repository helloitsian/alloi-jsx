import { useAtomic, render } from "alloi"

const Component = () => {
  const [count, setCount] = useAtomic(0);

  return <div>
    {count}
    <button onClick={() => setCount(count() + 1)}>
      Increment
    </button>
  </div>;
}

render(document.getElementById("app"), <Component/>);