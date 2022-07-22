const Path = require("path");
const { readFile } = require("fs/promises");
const { transformAsync } = require("@babel/core");
const AlloiJSXBabel = require("babel-plugin-transform-alloi-jsx");

module.exports = {
  name: "alloi-jsx",
  setup(build) {
    build.onLoad({ filter: /\.[^\/\s\?]+$/ }, async (args) => {
      const source = await readFile(args.path, { encoding: "utf8" });

      const filename = Path.basename(args.path);

      const { code } = await transformAsync(source, {
        plugins: [
          "@babel/plugin-syntax-jsx",
          AlloiJSXBabel,
        ],
        filename,
        sourceMaps: true,
      });

      return {
        contents: `
          import { createElement, createComponent, insert } from "alloi";
          ${code}
        `,
        loader: "js",
      };
    });
  },
};
