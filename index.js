const babel = require("@babel/core");
const { isCharUppercase } = require("./util.js");

class AlloiJSX {
  constructor() {
    this.before = this.parseJsx;
    this.after = (code) => code;

    this.before = this.before.bind(this);
    this.after = this.after.bind(this);
  } 

  createElementCreator(t, openingElement) {
    const { name } = openingElement.name;
    const { attributes } = openingElement;

    return t.callExpression(
      t.memberExpression(t.identifier("AlloiDOM"), t.identifier("createElement")),
      [
        t.stringLiteral(name),
        t.objectExpression(
          attributes.map((attr) => {
            return this.createAttribute(t, attr);
          })
        ),
      ]
    );
  }

  createInsert(t, parent, child) {
    let _child = child;

    if (child.type === "JSXExpressionContainer") {
      _child = child.expression;
    } else if (child.type === "JSXText") {
      _child = t.stringLiteral(child.value);
    } else if (child.type === "JSXElement") {
      const { openingElement } = child;
      _child = this.createElementCreator(t, openingElement);
    }

    return t.expressionStatement(
      t.callExpression(
        t.memberExpression(t.identifier("AlloiDOM"), t.identifier("insert")),
        [t.identifier(parent), t.identifier(_child)]
      )
    );
  }

  createAttribute(t, attr) {
    if (attr.type === "JSXAttribute") {
      return t.objectProperty(
        t.stringLiteral(attr.name.name),
        attr.value.value
          ? t.stringLiteral(attr.value.value)
          : attr.value.expression
      );
    }
  }

  convertJSXChildren(t, children, elId) {
    let childrenArray = [];
    let _parent = `__el${elId - 1}`;
    let _child = null;

    const self = this;
    const handlers = {
      JSXText: (child) => {
        const noWhiteSpace = child.value.replace(/\s/g, "");
        if (noWhiteSpace.length > 0) {
          _child = `__txtEl${elId}`;
          childrenArray.push(self.convertJSXTextNode(t, child, elId++));
          return _child;
        }
      },
      JSXExpressionContainer: (child) => {
        _child = `__el${++elId}`;
        childrenArray.push(self.convertJSXEspression(t, child, elId));
        return _child;
      },
      JSXSpreadChild: (child) => {
        _child = `__el${elId}`;
        console.log(child);
        return _child;
      },
      JSXElement: (child) => {
        _child = `__el${elId}`;
        childrenArray.push(
          self.convertJSXNode(t, child.openingElement, elId++)
        );

        // recurse through child's children
        if (child.children)
          childrenArray = [
            ...childrenArray,
            ...self.convertJSXChildren(t, child.children, elId),
          ];

        return _child;
      },
    };

    for (let i = 0; i < children.length; i++) {
      let child = children[i];

      if (!handlers[child.type]) {
        console.log(child.type);
      }

      let _child = handlers[child.type](child);

      if (_child) {
        childrenArray.push(this.createInsert(t, _parent, _child));
      }
    }
    return childrenArray;
  }

  convertJSXComponent(t, openingElement, elId = 0) {
    const { name, attributes } = openingElement;
    const componentName = name.name;
    const componentId = `__el${elId}`;

    const component = t.variableDeclaration("const", [
      t.variableDeclarator(
        t.identifier(componentId),
        t.callExpression(
          t.memberExpression(
            t.identifier("AlloiDOM"),
            t.identifier("createComponent")
          ),
          [
            t.identifier(componentName),
            t.objectExpression(
              attributes.map((attr) => {
                return this.createAttribute(t, attr);
              })
            ),
          ]
        )
      ),
    ]);

    return component;
  }

  // convert jsx to vanilla dom elements
  convertJSXNode(t, openingElement, elId) {
    const hasUppercase = isCharUppercase(openingElement.name.name[0]);

    if (hasUppercase) {
      return this.convertJSXComponent(t, openingElement, elId);
    }

    return t.variableDeclaration("const", [
      t.variableDeclarator(
        t.identifier(`__el${elId}`),
        this.createElementCreator(t, openingElement, elId)
      ),
    ]);
  }

  convertJSXTextNode(t, node, elId) {
    return t.variableDeclaration("const", [
      t.variableDeclarator(
        t.identifier(`__txtEl${elId}`),
        t.stringLiteral(node.value.trim())
      ),
    ]);
  }

  convertJSXEspression(t, node, elId = 0) {
    const { expression } = node;

    if (expression.type === "Identifier") {
      return t.variableDeclaration("const", [
        t.variableDeclarator(
          t.identifier(`__el${elId}`),
          expression,
        ),
      ]);
    }

    return t.variableDeclaration("const", [
      t.variableDeclarator(t.identifier(`__el${elId}`), expression),
    ]);
  }

  transformJSX(t, node, elId = 0) {
    const openingElement = node.openingElement;

    return [
      this.convertJSXNode(t, openingElement, elId++),
      ...this.convertJSXChildren(t, node.children, elId),
    ];
  }

  parseJsx(code) {
    var self = this;

    const newCode = babel.transformSync(code, {
      plugins: [
        "@babel/plugin-syntax-jsx",
        ({ types }) => {
          return {
            visitor: {
              JSXElement: (path) => {
                path.replaceWith(
                  types.expressionStatement(
                    types.callExpression(
                      types.arrowFunctionExpression(
                        [],
                        types.blockStatement([
                          ...self.transformJSX(types, path.node),
                          types.returnStatement(types.identifier(`__el0`)),
                        ])
                      ),
                      []
                    )
                  )
                );
              },
            },
          };
        },
      ],
    });

    const AlloiDOM = `{
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
      createComponent: (Component, props) => {
        return Component(props);
      }
    }`;

    return `
      const AlloiDOM = ${AlloiDOM};
      ${newCode.code}
    `;
  }
}

module.exports = AlloiJSX;
