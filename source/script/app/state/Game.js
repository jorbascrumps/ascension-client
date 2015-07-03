'use strict';

define(['phaser'], function (Phaser) {
    function Game () {}

    Game.prototype = {
        preload: function () {},

        create: function () {
            this.game.state.start('Game');
        }
    }

    return Game;
});

