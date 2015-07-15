'use strict';

define(['phaser', './Pawn'], function (Phaser, Pawn) {
    function Hero (game, group, options) {
        Pawn.call(this, game, group, options);
    }

    Hero.prototype = Object.create(Pawn.prototype);
    Hero.prototype.constructor = Hero;

    Hero.prototype._mouseOut = function () {
        this._graphics.removeChildren();
    }

    Hero.prototype._mouseOver = function () {
        var square = this._game.add.graphics();
        square.beginFill(0x00ff00, 0.5);
        square.lineStyle(1, 0x00ff00, 0.75);

        square.drawRect(this._transform.position.x - 40, this._transform.position.y + 40, 40, 40); // bottom left
        square.drawRect(this._transform.position.x - 40, this._transform.position.y, 40, 40); // left
        square.drawRect(this._transform.position.x - 40, this._transform.position.y - 40, 40, 40); // top left
        square.drawRect(this._transform.position.x, this._transform.position.y - 40, 40, 40); // top
        square.drawRect(this._transform.position.x + 40, this._transform.position.y - 40, 40, 40); // top right
        square.drawRect(this._transform.position.x + 40, this._transform.position.y, 40, 40); // right
        square.drawRect(this._transform.position.x + 40, this._transform.position.y + 40, 40, 40); // bottom right
        square.drawRect(this._transform.position.x, this._transform.position.y + 40, 40, 40); // bottom
        this._graphics.addChild(square);
    }

    return Hero;
});
