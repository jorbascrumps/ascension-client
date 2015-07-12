'use strict';

define(['phaser'], function (Phaser) {
    function Game () {
        this._cursor_position;
        this._player;
        this._tiles;
    }

    Game.prototype = {
        preload: function () {
            this.load.image('tile', 'image/tile.png');
            this.load.image('tile2', 'image/tile2.png');

            this.load.text('level', 'data/level.json');
        },

        create: function () {
            this._spawnTiles();
        },

        update: function () {
            this._tiles.forEach(function (tile, index, tiles) {
            }, this);
        },

        _selectTile: function (tile, cursor) {
            console.log(tile);
        },

        _spawnTiles: function () {
            var tile_data = JSON.parse(this.game.cache.getText('level'));
            this._tiles = this.game.add.group();

            tile_data.forEach(function (tile, index, tiles) {
                var tile_sprite = this.game.add.sprite(
                    tile.transform.position.x,
                    tile.transform.position.y,
                    tile.asset,
                    0,
                    this._tiles
                );
                tile_sprite.inputEnabled = true;
                tile_sprite.events.onInputDown.add(this._selectTile, this);
            }, this);
        }
    }

    return Game;
});

