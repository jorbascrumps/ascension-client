'use strict';

define(['phaser'], function (Phaser) {
    function Preload () {}

    Preload.prototype = {
        preload: function () {
        },

        create: function () {
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.state.start('Game');
        }
    }

    return Preload;
});

