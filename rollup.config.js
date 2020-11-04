import typescript from 'rollup-plugin-typescript2'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/theme.js',
      format: 'cjs',
    },
    // {
    //   file: 'dist/theme.min.js',
    //   format: 'cjs'
    // }
  ],
  plugins: [
    typescript(),
    babel(),
    commonjs(),
    terser()
  ]
}
