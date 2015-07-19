'use strict';

define(['phaser', 'state/Game'], function (Phaser, Game) {
    function Pawn (game, group, options) {
        Phaser.Sprite.call(
            this,
            game,
            options.transform.position.x,
            options.transform.position.y,
            options.asset
        );

        this._game = game;
        this._graphics = this._game.add.sprite(0, 0);
        var graphics = this._game.add.graphics();
        this._graphics.addChild(graphics);
        this._game.physics.arcade.enable(this._graphics);
        this._game.physics.arcade.enable(this);
        this.body.setSize(50, 50, 0, 0);

        this.height = options.transform.height;
        this.width = options.transform.width;
        this._transform = options.transform;

        this._game.add.existing(this);
        group.add(this);

        this._setupEvents();
    }

    Pawn.prototype = Object.create(Phaser.Sprite.prototype);
    Pawn.prototype.constructor = Pawn;

    Pawn.prototype._setupEvents = function () {
        this.inputEnabled = true;
        this.input.useHandCursor = true;

        this.events.onInputOver.add(this._mouseOver, this);
        this.events.onInputOut.add(this._mouseOut, this);
    };

    Pawn.prototype._mouseOver = function () {
    };

    Pawn.prototype._mouseOut = function () {
    };

    return Pawn;
});
