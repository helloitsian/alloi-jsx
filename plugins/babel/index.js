const { isCharUppercase } = require("./util.js");

const createElementCreator = (t, openingElement) => {
  const { name } = openingElement.name;
  const { attributes } = openingElement;

  return t.callExpression(
    t.identifier("createElement"),
    [
      t.stringLiteral(name),
      t.objectExpression(
        attributes.map((attr) => {
          return createAttribute(t, attr);
        })
      ),
    ]
  );
}

const createInsert = (t, parent, child) => {
  let _child = child;

  if (child.type === "JSXExpressionContainer") {
    _child = child.expression;
  } else if (child.type === "JSXText") {
    _child = t.stringLiteral(child.value);
  } else if (child.type === "JSXElement") {
    const { openingElement } = child;
    _child = createElementCreator(t, openingElement);
  }

  return t.expressionStatement(
    t.callExpression(
      t.identifier("insert"),
      [t.identifier(parent), t.identifier(_child)]
    )
  );
}

const createAttribute = (t, attr) => {
  if (attr.type === "JSXAttribute") {
    return t.objectProperty(
      t.stringLiteral(attr.name.name),
      attr.value.value
        ? t.stringLiteral(attr.value.value)
        : attr.value.expression
    );
  }
}

const convertJSXChildren = (t, children, elId) => {
  let childrenArray = [];
  let _parent = `__el${elId - 1}`;
  let _child = null;

  const handlers = {
    JSXText: (child) => {
      const noWhiteSpace = child.value.replace(/\s/g, "");
      if (noWhiteSpace.length > 0) {
        _child = `__txtEl${elId}`;
        childrenArray.push(convertJSXTextNode(t, child, elId));
        return _child;
      }
    },
    JSXExpressionContainer: (child) => {
      _child = `__el${elId}`;
      childrenArray.push(convertJSXEspression(t, child, elId));
      return _child;
    },
    JSXSpreadChild: (child) => {
      _child = `__el${elId++}`;
      return _child;
    },
    JSXElement: (child) => {
      _child = `__el${elId}`;
      childrenArray.push(
        convertJSXNode(t, child.openingElement, elId)
      );

      // recurse through child's children
      if (child.children)
        childrenArray = [
          ...childrenArray,
          ...convertJSXChildren(t, child.children, ++elId),
        ];

      return _child;
    },
  };

  for (let i = 0; i < children.length; i++) {
    let child = children[i];

    let _child = handlers[child.type](child);
    if (_child) {
      childrenArray.push(createInsert(t, _parent, _child));
      elId++;
    }
  }
  return childrenArray;
}

const convertJSXComponent = (t, openingElement, elId = 0) => {
  const { name, attributes } = openingElement;
  const componentName = name.name;
  const componentId = `__el${elId}`;

  const component = t.variableDeclaration("const", [
    t.variableDeclarator(
      t.identifier(componentId),
      t.callExpression( 
        t.identifier("createComponent"),
        [
          t.identifier(componentName),
          t.objectExpression(
            attributes.map((attr) => {
              return createAttribute(t, attr);
            })
          )
        ]
      )
    ),
  ]);

  return component;
}

// convert jsx to vanilla dom elements
const convertJSXNode = (t, openingElement, elId) => {
  const hasUppercase = isCharUppercase(openingElement.name.name[0]);

  if (hasUppercase) {
    return convertJSXComponent(t, openingElement, elId);
  }

  return t.variableDeclaration("const", [
    t.variableDeclarator(
      t.identifier(`__el${elId}`),
      createElementCreator(t, openingElement, elId)
    ),
  ]);
}

const convertJSXTextNode = (t, node, elId) => {
  return t.variableDeclaration("const", [
    t.variableDeclarator(
      t.identifier(`__txtEl${elId}`),
      t.stringLiteral(node.value.trim())
    ),
  ]);
}

const convertJSXEspression = (t, node, elId = 0) => {
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

const transformJSX = (t, node, elId = 0) => {
  const openingElement = node.openingElement;

  return [
    convertJSXNode(t, openingElement, elId++),
    ...convertJSXChildren(t, node.children, elId),
  ];
}

module.exports = function({ types: t }) {
  // plugin contents
  return {
    visitor: {
      JSXElement(path) {
        path.replaceWith(
          t.expressionStatement(
            t.callExpression(
              t.arrowFunctionExpression(
                [],
                t.blockStatement([
                  ...transformJSX(t, path.node),
                  t.returnStatement(t.identifier(`__el0`)),
                ])
              ),
              []
            )
          )
        );
      }
    }
  }
}
