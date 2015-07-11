'use strict';

define(['phaser'], function (Phaser) {
    function Game () {
        this._cursor_position;
        this._player;
        this._tiles;
    }

    Game.prototype = {
        preload: function () {
            this._tiles = this.game.add.group();
            this._spawnTiles();
            this._cursor_position = new Phaser.Plugin.Isometric.Point3();
        },

        create: function () {
            this.game.state.start('Game');
        },

        update: function () {
            this.game.iso.unproject(
                this.game.input.activePointer.position,
                this._cursor_position
            );

            this._tiles.forEach(function (tile) {
                var in_bounds = tile.isoBounds.containsXY(
                    this._cursor_position.x,
                    this._cursor_position.y
                );

                if (!tile.selected && in_bounds) {
                    tile.selected = true;
                    tile.tint = 0x86bfda;
                }
            }, this);
        },

        _movePlayer: function () {
            var in_bounds = sprite.isoBounds.containsXY(
                this._cursor_position.x,
                this._cursor_position.y
            );
        },

        _spawnTiles: function () {
            var tile,
                min_height = -110,
                max_height = 110,
                min_width = -110,
                max_width = 110;

            for (var xx = min_width; xx < max_width; xx += 55) {
                for (var yy = min_height; yy < max_height; yy += 55) {
                    tile = this.game.add.isoSprite(xx, yy, 0, 'tile', 0, this._tiles);
                    tile.anchor.set(0.5, 0);
                    tile.boundsPadding = 50;
                    tile.inputEnabled = true;
                    tile.name= '' + xx + yy;
                    tile.events.onInputDown.add(this._movePlayer, this);
                    // tile.events.onEnterBounds.add(this.trace, this);
                }
            }
        }
    }

    return Game;
});

