'use strict';

define(['phaser', 'state/Boot', 'state/Preload', 'state/Game'], function (Phaser, BootState, PreloadState, GameState) {
    function Game () {}

    Game.prototype = {
        start: function () {
            var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '');
            game.state.add('Boot', BootState);
            game.state.add('Preload', PreloadState);
            game.state.add('Game', GameState);
            game.state.start('Boot');
        }
    }

    return Game;
});
