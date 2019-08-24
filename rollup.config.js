import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import commonjs from 'rollup-plugin-commonjs';
import autoprefixer from 'autoprefixer';
import buble from 'rollup-plugin-buble';
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
    buble({
			jsx: 'h',
      objectAssign: 'Object.assign',
      exclude: '**/*.css'
    }),
    commonjs(),
		resolve(),
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
      file: pkg.module,
      format: 'esm',
    },
    external: getDependencies(pkg),
  },
  {
    ...base,
    output: {
      file: 'dist/reactyper.min.js',
      format: 'esm',
      globals: {
        react: 'React',
        'lodash.split': '_.split',
      },
      name: 'Typer',
    }
  }
];