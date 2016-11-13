import path from 'path';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-resolve-aliases';

const phaserPath = path.join(__dirname, 'node_modules/phaser');
const phaser = path.join(phaserPath, 'build/custom/phaser-split.js');
const pixi = path.join(phaserPath, 'build/custom/pixi.js');
const p2 = path.join(phaserPath, 'build/custom/p2.js');

export default {
    entry: 'source/index.js',
    format: 'umd',
    plugins: [
        babel(),
        resolve({
            aliases: {
                phaser,
                'pixi.js': pixi,
                p2
            }
        })
    ],
    dest: 'bundle.js'
}
