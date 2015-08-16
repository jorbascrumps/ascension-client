'use strict';

define(['phaser'], function (Phaser) {
    function Preload () {}

    Preload.prototype = {
        preload: function () {
            this.game.load.spritesheet('loading', 'image/ui/sprite/loading.GIF', 64, 64, 10);
        },

        create: function () {

            // Display loading indicator
            var loading = this.game.add.sprite(this.game.width - 84, this.game.height - 84, 'loading')
              , anim_loading = loading.animations.add('load');
            loading.animations.play('load', 10, true);

            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.state.start('Game');
        }
    }

    return Preload;
});

