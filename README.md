# alloi-jsx
A set of Plugins for parsing JSX into Alloi Code

## Using Babel
```javascript
import babel from '@babel/core'
import alloiJSXBabel from 'babel-plugin-transform-alloi-jsx'

const { code } = babel.transformSync(src, {
  plugins: [
    "@babel/plugin-syntax-jsx",
    alloiJSXBabel,
  ],
});
```

## Using [Paquet](https://github.com/helloitsian/paquet) (my custom made bundler, similar to Webpack)
```javascript
const AlloiJSX = require('alloi-jsx');

module.exports = {
  entry: './useAtomic.test.js',
  out: './dist/bundle.js',
  mutators: [
    new AlloiJSX(),
  ],
}
```

## Using ESbuild
```javascript
const { build } = require('esbuild');
const alloiJSX = require('esbuild-plugin-alloi-jsx');

build({
  entryPoints: ['./basic.test.jsx'],
  bundle: true,
  outfile: './dist/bundle.js',
  plugins: [
    alloiJSX
  ],
});
```

## Using Vite
```javascript
import alloiJSX from 'vite-plugin-alloi-jsx'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    alloiJSX(),
  ]
})
```
