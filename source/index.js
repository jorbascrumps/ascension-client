import BootState from './state/Boot';
import PreloadState from './state/Preload';
import GameState from './state/Game';

class Game extends Phaser.Game {
    constructor ({ width, height }) {
        super(width, height, Phaser.AUTO, 'client');
    }

    start () {
        this.state.add('Boot', BootState);
        this.state.add('Preload', PreloadState);
        this.state.add('Game', GameState);

        this.state.start('Boot');
    }
}

const game = new Game({
    width: window.innerWidth,
    height: window.innerHeight
});
game.start()
