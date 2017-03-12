import path from 'path';
import babel from 'rollup-plugin-babel';
import alias from 'rollup-plugin-resolve-aliases';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';

const phaserPath = path.join(__dirname, 'node_modules/phaser');
const phaser = path.join(phaserPath, 'build/custom/phaser-split.js');
const pixi = path.join(phaserPath, 'build/custom/pixi.js');
const p2 = path.join(phaserPath, 'build/custom/p2.js');

export default {
    entry: 'source/index.js',
    format: 'umd',
    plugins: [
        babel(),
        commonjs(),
        resolve({
            jsnext: true,
            main: true,
            browser: true
        }),
        alias({
            aliases: {
                phaser,
                'pixi.js': pixi,
                p2
            }
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ],
    dest: 'bundle.js'
}
