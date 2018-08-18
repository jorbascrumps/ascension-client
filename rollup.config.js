import babel from 'rollup-plugin-babel';
import builtins from 'rollup-plugin-node-builtins';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';

export default {
    input: 'source/index.js',
    output: {
        file: 'bundle.js',
        format: 'umd'
    },
    plugins: [
        json({
            exclude: 'node_modules/**',
            preferConst: true
        }),
        babel({
            exclude: 'node_modules/**'
        }),
        builtins(),
        resolve({
            jsnext: true,
            main: true,
            browser: true
        }),
        commonjs(),
        replace({
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ]
};
