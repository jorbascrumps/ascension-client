'use strict';

define(['phaser'], function (Phaser) {
    function Tile (game, group, options) {
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
        game.physics.p2.enable(this, true);

        this.body.clearShapes();
        this.body.loadPolygon('tile3_physics', 'tile3')
        this._setupEvents();
    }

    Tile.prototype = Object.create(Phaser.Sprite.prototype);
    Tile.prototype.constructor = Tile;

    Tile.prototype._setupEvents = function () {
        this.inputEnabled = true;
        this.input.useHandCursor = true;
        this.input.pixelPerfectOver = true;

        this.events.onInputDown.add(this._click, this);
        this.events.onInputOver.add(this._mouseOver, this);
        this.events.onInputOut.add(this._mouseOut, this);
    };

    Tile.prototype._click = function () {
        console.log('_click');
    };

    Tile.prototype._mouseOver = function () {
        console.log('_mouseOver');
        this.tint = 0x990000;
    };

    Tile.prototype._mouseOut = function () {
        console.log('_mouseOut');
        this.tint = 0xffffff;
    };

    return Tile;
});
