import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

const getDependencies = ({ dependencies = {}, peerDependencies = {} }) => [
  ...Object.keys(dependencies),
  ...Object.keys(peerDependencies),
];

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'esm',
    },
    {
      file: 'dist/react-typer.min.js',
      format: 'umd',
      globals: {
        react: 'React',
        'lodash.split': '_.split',
      },
      name: 'Typer',
    }
  ],
  external: getDependencies(pkg),
  plugins: [
    typescript({
      typescript: require('typescript'),
      objectHashIgnoreUnknownHack: true,
    }),
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