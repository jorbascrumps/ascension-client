'use strict';

define(['phaser', './Pawn'], function (Phaser, Pawn) {
    function Hero (game, group, options) {
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

    Hero.prototype = Object.create(Pawn.prototype);
    Hero.prototype.constructor = Hero;

    Hero.prototype._setupEvents = function () {
        this.inputEnabled = true;
        this.input.useHandCursor = true;
    };

    return Hero;
});
