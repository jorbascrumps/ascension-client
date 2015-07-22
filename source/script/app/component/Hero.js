'use strict';

define(['phaser', './Pawn'], function (Phaser, Pawn) {
    function Hero (game, group, options) {
        Pawn.call(this, game, group, options);
    }

    Hero.prototype = Object.create(Pawn.prototype);
    Hero.prototype.constructor = Hero;

    Hero.prototype._mouseOut = function () {
        this._graphics.children[0].removeChildren();
    }

    Hero.prototype._mouseOver = function () {
        if (this._moving) {
            return;
        }

        var square = this._game.add.graphics();
        square.beginFill(0x00ff00, 0.5);
        square.lineStyle(1, 0x00ff00, 0.75);

        square.drawRect(this.position.x - 50, this.position.y + 50, 50, 50); // bottom left
        square.drawRect(this.position.x - 50, this.position.y, 50, 50); // left
        square.drawRect(this.position.x - 50, this.position.y - 50, 50, 50); // top left
        square.drawRect(this.position.x, this.position.y - 50, 50, 50); // top
        square.drawRect(this.position.x + 50, this.position.y - 50, 50, 50); // top right
        square.drawRect(this.position.x + 50, this.position.y, 50, 50); // right
        square.drawRect(this.position.x + 50, this.position.y + 50, 50, 50); // bottom right
        square.drawRect(this.position.x, this.position.y + 50, 50, 50); // bottom

        this._graphics.children[0].addChild(square);
    }

    return Hero;
});
