import babel from 'rollup-plugin-babel';
import builtins from 'rollup-plugin-node-builtins';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';

export default {
    input: 'source/index.js',
    output: {
        file: 'bundle.js',
        format: 'umd'
    },
    plugins: [
        babel(),
        builtins(),
        commonjs(),
        resolve({
            jsnext: true,
            main: true,
            browser: true
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ]
};
