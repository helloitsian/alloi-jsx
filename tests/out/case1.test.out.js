
      import { createElement, createComponent, insert } from "alloi";

      import { useAtomic, render } from "alloi";

const Component = () => {
  const [count, setCount] = useAtomic(0);
  return (() => {
    const __el0 = createElement("div", {});

    const __el1 = count;
    insert(__el0, __el1);

    const __el2 = createElement("h1", {});

    const __el3 = count;
    insert(__el2, __el3);
    insert(__el0, __el2);

    const __el4 = createElement("button", {
      "onClick": () => setCount(count() + 1)
    });

    const __txtEl5 = "Click me!";
    insert(__el4, __txtEl5);
    insert(__el0, __el4);
    return __el0;
  })();
}; // render the component


const root = document.querySelector("#app");
render(root, (() => {
  const __el0 = createComponent(Component, {});

  return __el0;
})());
export default Component;
    