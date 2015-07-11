'use strict';

define(['phaser'], function (Phaser) {
    function Preload () {}

    Preload.prototype = {
        preload: function () {
            this.load.image('tile', 'image/tile1.png');
            this.load.image('player', 'image/tile2.png');
        },

        create: function () {
            this.game.state.start('Game');
        }
    }

    return Preload;
});

