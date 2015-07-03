'use strict';

define(['phaser'], function (Phaser) {
    function Boot () {}

    Boot.prototype = {
        preload: function () {},

        create: function () {
            this.game.state.start('Preload');
        }
    }

    return Boot;
});

