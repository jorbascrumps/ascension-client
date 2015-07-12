'use strict';

define(['phaser'], function (Phaser) {
    function Preload () {}

    Preload.prototype = {
        preload: function () {
        },

        create: function () {
            this.game.state.start('Game');
        }
    }

    return Preload;
});

