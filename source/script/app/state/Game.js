'use strict';

define(['phaser', 'component/Tile'], function (Phaser, Tile) {
    function Game () {
        this._cursor_position;
        this._player;
        this._tiles;
    }

    Game.prototype = {
        preload: function () {
            this.load.image('tile', 'image/tile.png');
            this.load.image('tile2', 'image/tile2.png');
            this.load.image('tile3', 'image/tile3.png');

            this.load.text('level', 'data/level.json');
        },

        create: function () {
            this._spawnTiles();
        },

        update: function () {
            this._tiles.forEach(function (tile, index, tiles) {
            }, this);
        },

        _spawnTiles: function () {
            var tile_data = JSON.parse(this.game.cache.getText('level'));
            this._tiles = this.game.add.group();

            tile_data.forEach(function (tile, index, tiles) {
                var test = new Tile(this.game, this._tiles, tile);
            }, this);
        }
    }

    return Game;
});

