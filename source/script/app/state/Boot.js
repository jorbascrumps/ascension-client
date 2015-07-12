'use strict';

define(['phaser'], function (Phaser) {
    function Boot () {}

    Boot.prototype = {
        preload: function () {},

        create: function () {
            this.input.maxPointers = 1;
            this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.setScreenSize(true);

            this.game.state.start('Preload');
        }
    }

    return Boot;
});

