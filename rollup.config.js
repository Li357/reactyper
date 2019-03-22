import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

const getDependencies = ({ dependencies = {}, peerDependencies = {} }) => [
  ...Object.keys(dependencies),
  ...Object.keys(peerDependencies),
];

const base = {
  input: 'src/index.tsx',
  plugins: [
    typescript({
      typescript: require('typescript'),
      objectHashIgnoreUnknownHack: true,
    }),
    resolve(),
    commonjs(),
    postcss({
      plugins: [
        autoprefixer({ browsers: ['last 2 versions'] }),
      ],
    }),
    terser({
      mangle: {
        reserved: ['Typer', 'Character', 'Caret'],
      },
    }),
  ],
};

export default [
  {
    ...base,
    output: {
      file: pkg.main,
      format: 'cjs',
    },
    external: getDependencies(pkg),
  },
  {
    ...base,
    output: {
      file: pkg.module,
      format: 'esm',
    },
    external: getDependencies(pkg),
  },
  {
    ...base,
    output: {
      file: 'dist/react-typer.min.js',
      format: 'umd',
      globals: {
        react: 'React',
        'lodash.split': '_.split',
      },
      name: 'Typer',
    },
    external: Object.keys(pkg.peerDependencies),
  },
];