import BootState from './state/Boot';
import PreloadState from './state/Preload';
import GameState from './state/Game';

class Game extends Phaser.Game {
    constructor (...args) {
        super(...args);
    }

    start () {
        this.state.add('Boot', BootState);
        this.state.add('Preload', PreloadState);
        this.state.add('Game', GameState);

        this.state.start('Boot');
    }
}

const game = new Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '');
game.start()
