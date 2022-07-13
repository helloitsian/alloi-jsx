
      const reactors = [];

      const cleanupDependencies = (currentReactor) => {
        for (const dep of currentReactor.dependencies) {
          dep.delete(currentReactor);
        }
        currentReactor.dependencies.clear();
      }

      const AlloiDOM = {
      createElement: (tag, attrs) => {
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
      },
      convertToNode: (child) => {
        if (typeof child === 'string' || typeof child === 'number') {
          return document.createTextNode(child);
        } else if (typeof child === 'function') {
          return AlloiDOM.convertToNode(child());
        } else {
          return child;
        }
      },
      insert: (parent, child) => {
        let childNode = AlloiDOM.convertToNode(child);
        parent.appendChild(childNode);

        if (typeof child === 'function') {
          AlloiReactive.createReactor(() => {
            const newChild = AlloiDOM.convertToNode(child);
            parent.replaceChild(newChild, childNode);
            childNode = newChild;
          })
        }
      },
      render: (rootEl, rootNode) => {
        rootEl.appendChild(rootNode);
      }
    };
      const AlloiReactive = {
      subscribeToAtomic: (running, subscriptions) => {
        subscriptions.add(running);
      },
      useAtomic: (state) => {
        const subscriptions = new Set();
      
        const setState = (newState) => {
          state = newState;
          for (const sub of [...subscriptions]) {
            sub.react();
          }
        }
      
        const getState = () => {
          const reactor = reactors[reactors.length - 1];
          if (reactor) AlloiReactive.subscribeToAtomic(reactor, subscriptions);
          return state;
        };
      
        return [getState, setState];
      },
      createReactor: (fn) => {
        const react = () => {
          cleanupDependencies(currentReactor);
          reactors.push(currentReactor);
          try {
            fn();
          } finally {
            reactors.pop();
          }
        };
      
        const currentReactor = {
          react,
            dependencies: new Set()
          };
      
        react();
      }
    };
      const Component = () => {
  const [count, setCount] = AlloiReactive.useAtomic(0);
  return (() => {
    const __el0 = AlloiDOM.createElement("div", {});

    const __el1 = AlloiDOM.createElement("h1", {});

    const __el3 = count;
    AlloiDOM.insert(__el1, __el3);
    AlloiDOM.insert(__el0, __el1);

    const __el2 = AlloiDOM.createElement("button", {
      "onClick": () => setCount(count() + 1)
    });

    const __txtEl3 = "Click me!";
    AlloiDOM.insert(__el2, __txtEl3);
    AlloiDOM.insert(__el0, __el2);
    return __el0;
  })();
};
    