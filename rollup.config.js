import path from 'path'
import ttypescript from 'ttypescript'
import typescriptPlugin from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'
import pkgCore from './packages/core/package.json'

const extensions = ['.js', '.jsx', '.ts', '.tsx']

const babelRuntimeVersion = pkg.devDependencies['@babel/runtime'].replace(
  /^[^0-9]*/,
  '',
)

const packages = [
  {
    folder: path.join(__dirname, './packages/core'),
    pkg: pkgCore,
  },
]


const configs = packages.map((target) => {
  const {folder, pkg} = target

  return {
    input: path.join(folder, 'src/index.ts'),
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    output: [
      {
        file: path.join(folder, pkg.main),
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        assetFileNames: '[name][extname]',
      },
      {
        file: path.join(folder, pkg.module),
        format: 'esm',
        sourcemap: true,
        exports: 'named',
        assetFileNames: '[name][extname]',
      },
    ],
    plugins: [
      resolve({ extensions }),
      typescriptPlugin({
        typescript: ttypescript,
        tsconfig: path.join(folder, './tsconfig.json'),
        abortOnError: false,
        useTsconfigDeclarationDir: true,
        verbosity: 1,
      }),
      commonjs(),
      babel({
        extensions,
        include: ['src/**/*'],
        plugins: [
          ['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }],
        ],
        babelHelpers: 'runtime',
      }),
      terser(),
    ],
  }
})

export default configs