(() => {
  // node_modules/alloi/packages/alloi/reactive/index.js
  var collectionId = 0;
  var collections = {};
  var sub = (reactor) => {
    const owner = collections[`${collectionId - 1}`];
    owner.reactors.push(reactor);
  };
  var createCollection = () => {
    const collection = {
      atoms: [],
      reactors: []
    };
    collections[collectionId++] = collection;
  };
  var useAtomic = (state) => {
    const owner = collections[`${collectionId - 1}`];
    owner.atoms.push(state);
    const atomIndex = owner.atoms.length - 1;
    const setState = (newState) => {
      owner.atoms[atomIndex] = newState;
      for (let reactor of owner.reactors) {
        reactor();
      }
    };
    const getState = () => {
      return owner.atoms[atomIndex];
    };
    return [getState, setState];
  };
  var createReactor = (fn, options = {}) => {
    sub(fn);
  };
  var runReactors = () => {
    const owner = collections[`${collectionId - 1}`];
    for (let reactor of owner.reactors) {
      reactor();
    }
  };

  // node_modules/alloi/packages/alloi/dom/index.js
  var createElement = (tag, attrs) => {
    const el = document.createElement(tag);
    for (let key in attrs) {
      const isEvent = key.startsWith("on");
      if (isEvent) {
        el.addEventListener(key.substring(2).toLowerCase(), attrs[key]);
      } else {
        el.setAttribute(key, attrs[key]);
      }
    }
    return el;
  };
  var createComponent = (Component2, props) => {
    createCollection();
    const rendered = Component2(props);
    runReactors();
    return rendered;
  };
  var convertToNode = (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return document.createTextNode(child);
    } else if (typeof child === "function") {
      return convertToNode(child());
    } else {
      return child;
    }
  };
  var insert = (parent, child) => {
    let childNode = convertToNode(child);
    parent.appendChild(childNode);
    if (typeof child === "function") {
      createReactor(() => {
        const newChild = convertToNode(child);
        parent.replaceChild(newChild, childNode);
        childNode = newChild;
      });
    }
  };
  var render = (rootEl, rootNode) => {
    rootEl.appendChild(rootNode);
  };

  // basic.test.jsx
  var Component = () => {
    const [count, setCount] = useAtomic(0);
    return (() => {
      const __el0 = createElement("div", {});
      const __el1 = count;
      insert(__el0, __el1);
      const __el2 = createElement("button", {
        "onClick": () => setCount(count() + 1)
      });
      const __txtEl3 = "Increment";
      insert(__el2, __txtEl3);
      insert(__el0, __el2);
      return __el0;
    })();
  };
  render(document.getElementById("app"), (() => {
    const __el0 = createComponent(Component, {});
    return __el0;
  })());
})();
