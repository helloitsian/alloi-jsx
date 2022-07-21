const { build } = require('esbuild');
const AlloiJSX = require('../index.js');

build({
  entryPoints: ['./basic.test.jsx'],
  bundle: true,
  outfile: './dist/bundle.js',
  plugins: [
    AlloiJSX
  ],
});