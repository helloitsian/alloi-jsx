
      import { createElement, createComponent, insert } from "alloi";

      import { useAtomic, render } from "alloi";

const Component = () => {
  const [count, setCount] = useAtomic(0);
  return (() => {
    const __el0 = createElement("div", {});

    const __el1 = createElement("h1", {});

    const __el3 = count;
    insert(__el1, __el3);
    insert(__el0, __el1);

    const __el2 = createElement("button", {
      "onClick": () => setCount(count() + 1)
    });

    const __txtEl3 = "Click me!";
    insert(__el2, __txtEl3);
    insert(__el0, __el2);
    return __el0;
  })();
}; // render the component


const root = document.querySelector("#app");
render(root, (() => {
  const __el0 = createComponent(Component, {});

  return __el0;
})());
export default Component;
    