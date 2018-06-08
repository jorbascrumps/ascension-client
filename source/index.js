import "@babel/polyfill";

import * as scene from './states/game';

window.onload = () => {
    const game = new Phaser.Game({
        transparent: true,
        height: 500,
        parent: 'game',
        pixelArt: true,
        scene,
        type: Phaser.AUTO,
        width: 500
    });
};
