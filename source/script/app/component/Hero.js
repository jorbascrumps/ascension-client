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

    return Hero;
});
