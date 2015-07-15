'use strict';

define(['phaser'], function (Phaser) {
    function Pawn (game, group, options) {
        Phaser.Sprite.call(
            this,
            game,
            options.transform.position.x,
            options.transform.position.y,
            options.asset
        );

        this.height = options.transform.height;
        this.width = options.transform.width;

        game.add.existing(this);
        group.add(this);

        this._setupEvents();
    }

    Pawn.prototype = Object.create(Phaser.Sprite.prototype);
    Pawn.prototype.constructor = Pawn;

    Pawn.prototype._setupEvents = function () {
        this.inputEnabled = true;
        this.input.useHandCursor = true;
    };

    return Pawn;
});
