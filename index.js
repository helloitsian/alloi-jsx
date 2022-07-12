const babel = require("@babel/core");
const { isCharUppercase } = require("./util.js");

class LiquidJsx {
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
      t.memberExpression(
        t.identifier("Liquid"),
        t.identifier("createElement")
      ),
      [
        t.stringLiteral(name),
        t.objectExpression(
          attributes.map((attr) => {
            return this.createAttribute(t, attr);
          })
        ),
      ]
    )
  }
      

  createAppendChild(t, parent, child) {
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
        t.memberExpression(t.identifier(parent), t.identifier("appendChild")),
        [t.identifier(_child)]
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
        _child = `__el${elId}`;
        childrenArray.push(self.convertJSXEspression(t, child, elId++));
        return _child;
      },
      JSXSpreadChild: (child) => {
        _child = `__el${elId}`;
        console.log(child);
        return _child;
      },
      JSXElement: (child) => {
        _child = `__el${elId}`;
        childrenArray.push(self.convertJSXNode(t, child.openingElement, elId++));

        // recurse through child's children
        if (child.children)
          childrenArray = [...childrenArray, ...self.convertJSXChildren(t, child.children, elId)];

        return _child;
      }
    }

    for (let i = 0; i < children.length; i++) {
      let child = children[i];

      if  (!handlers[child.type]) {
        console.log(child.type);
      }

      let _child = handlers[child.type](child);

      if (_child) {
        childrenArray.push(this.createAppendChild(t, _parent, _child));
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
        t.callExpression(t.identifier(componentName), [
          t.objectExpression(
            attributes.map((attr) => {
              return this.createAttribute(t, attr);
            })
          ),
        ])
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
        this.createElementCreator(t, openingElement, elId),
      ),
    ]);
  }

  convertJSXTextNode(t, node, elId) {
    return t.variableDeclaration("const", [
      t.variableDeclarator(
        t.identifier(`__txtEl${elId}`),
        t.callExpression(
          t.memberExpression(
            t.identifier("Liquid"),
            t.identifier("createTextNode")
          ),
          [t.stringLiteral(node.value)]
        )
      ),
    ]);
  }

  convertJSXEspression(t, node, elId = 0) {
    const { expression } = node;
    
    if (expression.type === "Identifier") {
      return t.variableDeclaration("const", [
        t.variableDeclarator(
          t.identifier(`__el${elId}`),
          t.callExpression(
            t.memberExpression(
              t.identifier("Liquid"),
              t.identifier("createTextNode")
            ),
            [expression]
          )
        ),
      ]);
    }
    
    return t.variableDeclaration("const", [
      t.variableDeclarator(
        t.identifier(`__el${elId}`),
        expression
      ),
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

    const Liquid = `{
      createElement: (tag, attrs) => {
        const el = document.createElement(tag);
        for (let key in attrs) {
          const isEvent = key.startsWith("on");
          if (isEvent) {
            el.addEventListener(key.substring(2), attrs[key]);
          } else {
            el.setAttribute(key, attrs[key]);
          }
        };

        return el;
      },
      createTextNode: (text) => {
        return document.createTextNode(text);
      },
    }`;

    return `
      const Liquid = ${Liquid};
      ${newCode.code}
    `;
  }
}

module.exports = LiquidJsx;