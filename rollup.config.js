import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';

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
      format: 'es',
    },
  ],
  external: getDependencies(pkg),
  plugins: [
    typescript({
      typescript: require('typescript'),
      objectHashIgnoreUnknownHack: true,
    }),
    postcss(),
  ],
};