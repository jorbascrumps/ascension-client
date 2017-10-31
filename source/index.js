import * as scene from './states/game';

window.onload = () => {
    const game = new Phaser.Game({
        height: 500,
        parent: 'game',
        scene,
        type: Phaser.AUTO,
        width: 500
    });
};
