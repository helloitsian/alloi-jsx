const babel = require("@babel/core");
const AlloiJSXBabel = require("babel-plugin-transform-alloi-jsx");

class AlloiJSX {
  constructor() {
    this.before = this.parseJsx;
    this.after = (code) => code;

    this.before = this.before.bind(this);
    this.after = this.after.bind(this);
  } 

  parseJsx(code, absolutePath) {
    if (absolutePath.includes("node_modules")) {
      return code;
    }

    const newCode = babel.transformSync(code, {
      plugins: [
        "@babel/plugin-syntax-jsx",
        AlloiJSXBabel,
      ],
    });

    return `
      import { createElement, createComponent, insert } from "alloi";
      ${newCode.code}
    `;
  }
}

module.exports = AlloiJSX;
