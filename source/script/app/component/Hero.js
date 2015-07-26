'use strict';

define(['phaser', './Pawn'], function (Phaser, Pawn) {
    function Hero (game, group, options) {
        Pawn.call(this, game, group, options);
    }

    Hero.prototype = Object.create(Pawn.prototype);
    Hero.prototype.constructor = Hero;

    Hero.prototype._mouseOut = function () {
        this._tracing = false;
        this._tile_traces.removeChildren();
        this._tile_collisions.removeChildren();
    };

    Hero.prototype._mouseOver = function () {
        if (this._moving) {
            return;
        }

        this._tracing = true;
        var positions = [
            { x : this.position.x - 50, y: this.position.y + 50 }, // bottom left
            { x : this.position.x - 50, y: this.position.y      }, // left
            { x : this.position.x - 50, y: this.position.y - 50 }, // top left
            { x : this.position.x,      y: this.position.y - 50 }, // top
            { x : this.position.x + 50, y: this.position.y - 50 }, // top right
            { x : this.position.x + 50, y: this.position.y      }, // right
            { x : this.position.x + 50, y: this.position.y + 50 }, // bottom right
            { x : this.position.x,      y: this.position.y + 50 }  // bottom
        ];
        positions.forEach(this._traceAdjacentTiles, this);
    };

    Hero.prototype._update = function (collisions) {
        this._game.physics.arcade.overlap(
            collisions,
            this._tile_collisions,
            function (collider, tile) {
                var index = this._tile_collisions.getChildIndex(tile),
                    traced_tile = this._tile_traces.getChildAt(index);
                traced_tile.clear();
            },
            null,
            this
        );
    };

    Hero.prototype._traceAdjacentTiles = function (position, index) {
        var sprite = this._tile_collisions.create(position.x, position.y);
        this._game.physics.arcade.enable(sprite);
        sprite.body.setSize(50, 50);
        sprite.body.immovable = true;

        var square = this._game.add.graphics();
        square.beginFill(0x00ff00, 0.5);
        square.lineStyle(2, 0x00ff00, 1);
        square.drawRect(position.x, position.y, 50, 50);
        this._tile_traces.addChild(square);
    };

    return Hero;
});
