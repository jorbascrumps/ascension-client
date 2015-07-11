'use strict';

define(['phaser', 'isometric'], function (Phaser, Isometric) {
    function Boot () {}

    Boot.prototype = {
        preload: function () {
            this.game.plugins.add(new Isometric(this.game));
            this.game.iso.anchor.setTo(0.5, 0.5);
        },

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

