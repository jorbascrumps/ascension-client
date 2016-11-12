import babel from 'rollup-plugin-babel';

export default {
    entry: 'source/index.js',
    format: 'cjs',
    plugins: [
        babel()
    ],
    dest: 'bundle.js'
}
