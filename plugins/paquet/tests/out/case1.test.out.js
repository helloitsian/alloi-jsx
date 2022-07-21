
      import { createElement, createComponent, insert } from "alloi";
      import { useAtomic, render } from "alloi";

const Component = () => {
  const [count, setCount] = useAtomic(0);
  return (() => {
    const __el0 = createElement("div", {});

    const __el1 = createElement("h1", {});

    const __el2 = count;
    insert(__el1, __el2);
    insert(__el0, __el1);

    const __el3 = createElement("button", {
      "onClick": () => setCount(count() + 1)
    });

    const __txtEl4 = "Click me!";
    insert(__el3, __txtEl4);
    insert(__el0, __el3);
    return __el0;
  })();
}; // render the component


const root = document.querySelector("#app");
render(root, (() => {
  const __el0 = createComponent(Component, {});

  return __el0;
})());
export default Component;
    