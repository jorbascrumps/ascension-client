'use strict';

define(['phaser', './Pawn'], function (Phaser, Pawn) {
    function Hero (game, group, options) {
        Pawn.call(this, game, group, options);
        this._traceAdjacentTiles();
    }

    Hero.prototype = Object.create(Pawn.prototype);
    Hero.prototype.constructor = Hero;

    Hero.prototype._update = function (collisions) {
        this._game.physics.arcade.overlap(
            collisions,
            this._tile_collisions,
            function (collider, tile) {
                var index = this._tile_collisions.getChildIndex(tile),
                    collided_tile = this._tile_collisions.getChildAt(index),
                    traced_tile = this._tile_traces.getChildAt(index);
                traced_tile.clear();
                collided_tile.valid = false;
            },
            null,
            this
        );
    };

    Hero.prototype._traceAdjacentTiles = function () {
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

        positions.forEach(this._traceAtPosition, this);
    };

    Hero.prototype._clearTrace = function () {
        this._tracing = false;
        this._tile_traces.removeChildren();
        this._tile_collisions.removeChildren();
    };

    Hero.prototype._canMoveToTile = function (tile, pointer) {
        if (tile.valid) {
            this._clearTrace();
            this._moveTo({
                x: this._game.input.mousePointer.x + this._game.camera.x,
                y: this._game.input.mousePointer.y + this._game.camera.y
            });
        }
    };

    Hero.prototype._traceAtPosition = function (position, index) {
        var sprite = this._tile_collisions.create(position.x, position.y);
        this._game.physics.arcade.enable(sprite);
        sprite.inputEnabled = true;
        sprite.valid = true;
        sprite.events.onInputDown.add(this._canMoveToTile, this);
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
