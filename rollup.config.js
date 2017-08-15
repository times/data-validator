import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import pkg from './package.json';

export default [
  {
    entry: 'src/index.js',
    targets: [
      // UMD for Node and browsers
      { dest: pkg.main, format: 'umd', moduleName: 'timesDataValidator' },
      // ES module for other bundlers
      { dest: pkg.module, format: 'es' },
    ],
    plugins: [babel(babelrc())],
  },
];
