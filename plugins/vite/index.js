import babel from "@babel/core";
import alloiJSXBabel from "babel-plugin-transform-alloi-jsx";

const fileRegex = /.*\.(js|jsx)$/g

export default function alloiJSX () {
  return {
    name: 'alloi-jsx',

    config() {
      return {
        // only apply esbuild to ts files
        // since we are handling jsx and tsx now
        esbuild: {
          include: /\.ts$/
        },
      }
    },

    transform(src, id) {
      if (!id.includes("node_modules") && fileRegex.test(id)) {
        const { code } = babel.transformSync(src, {
          plugins: [
            "@babel/plugin-syntax-jsx",
            alloiJSXBabel,
          ],
        });

        return {
          code: `
            import { createElement, createComponent, insert } from "alloi";
            ${code}
          `,
          map: null // provide source map if available
        }
      }
    }
  }
}