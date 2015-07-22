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

        group.add(this);

        this._game = game;
        this.height = options.transform.height;
        this.width = options.transform.width;
        this._graphics = this._game.add.sprite(0, 0);
        this._moving = false;

        // Setup graphics object for drawing UI elememts for this pawn
        var graphics = this._game.add.graphics();
        this._graphics.addChild(graphics);
        this._game.physics.arcade.enable(this._graphics);
        this._game.physics.arcade.enable(this);

        // Physics settings
        this.body.setSize(50, 50, 0, 0);
        this.body.moves = false;

        this._game.add.existing(this);

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

    Pawn.prototype._moveTo = function (position, callback) {
        var new_pos = {
                x: position.x - (position.x % 50),
                y: position.y - (position.y % 50)
            },
            line = new Phaser.Line(
                this.position.x,
                this.position.y,
                new_pos.x,
                new_pos.y
            ),
            length = Math.floor(line.length),
            movement_duration = (length - (length % 50)) * 10;

        this._moving = true;
        this.game.add.tween(this)
            .to(new_pos, movement_duration, Phaser.Easing.Linear.None)
            .start()
            .onComplete.add(function () {
                this._moving = false;
            }, this);
    }

    return Pawn;
});
