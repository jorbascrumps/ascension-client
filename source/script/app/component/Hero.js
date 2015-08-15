'use strict';

define(['phaser', './Pawn'], function (Phaser, Pawn) {
    function Hero (game, group, options) {
        Pawn.call(this, game, group, options);
        this._traceAdjacentTiles();
    }

    Hero.prototype = Object.create(Pawn.prototype);
    Hero.prototype.constructor = Hero;

    Hero.prototype._update = function (collisions, blocked, tagged) {
        this._tile_collisions.children.forEach(function (tile, index, tiles) {
            var layer_tile = blocked.getTiles(tile.position.x, tile.position.y, 50, 50).shift(),
                bounds = new Phaser.Rectangle(layer_tile.worldX, layer_tile.worldY, layer_tile.width, layer_tile.height);

            if (layer_tile.index < 0) {
                return;
            }

            if (Phaser.Rectangle.intersects(tile.getBounds(), bounds)) {
                var traced_tile = traced_tile = this._tile_traces.getChildAt(index),
                    collided_tile = this._tile_collisions.getChildAt(index);
                traced_tile.clear();
                collided_tile.valid = false;
            }
        }, this);

        var tagged_tile = tagged.getTiles(this.position.x, this.position.y, 50, 50).shift();
        if (tagged_tile) {
            if (tagged_tile.index > 0) {
                if (!this._trigger_tag) {
                    this._event.emit('pawn.tagged.enter', {
                        x: 0,
                        y: 0
                    }, true);
                    this._onEnterTaggedTile(tagged_tile);
                }
            } else {
                if (this._trigger_tag) {
                    this._event.emit('pawn.tagged.exit', null, true);
                    this._onExitTaggedTile();
                }
            }
        }

        this._game.physics.arcade.overlap(
            collisions,
            this._tile_collisions,
            function (collider, tile) {
                var index = this._tile_collisions.getChildIndex(tile)
                  , traced_tile = this._tile_traces.getChildAt(index);

                traced_tile.clear();
                tile.valid = false;
            },
            function (collider, tile) {
                return tile.valid;
            },
            this
        );
    };

    Hero.prototype._postMovement = function () {
        this._traceAdjacentTiles();
    };

    return Hero;
});
