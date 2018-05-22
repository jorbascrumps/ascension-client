import * as scene from './states/game';

window.onload = () => {
    const game = new Phaser.Game({
        height: 500,
        parent: 'game',
        pixelArt: true,
        scene,
        type: Phaser.AUTO,
        width: 500
    });
};
