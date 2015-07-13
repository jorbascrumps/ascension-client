'use strict';

define(['phaser', 'component/Tile'], function (Phaser, Tile) {
    function Game () {
        this._cursor_position;
        this._player;
        this._tiles;
    }

    Game.prototype = {
        preload: function () {
            var grid_data = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAFFJREFUWIXtzjERACAQBDFgMPOKzr8ScADFFlBsFKRX1WqfStLG68SNQcogZZAySBmkDFIGKYOUQcogZZAySBmkDFIGKYOUQcog9X1wJnl9ONrTcwPWLGFOywAAAABJRU5ErkJggg==',
                background = new Image();

            background.src = grid_data;
            this.game.cache.addImage('grid', grid_data, background);

            this.load.image('tile', 'image/tile.png');
            this.load.image('tile2', 'image/tile2.png');
            this.load.image('tile3', 'image/tile3.png');

            this.load.text('level', 'data/level.json');
        },

        create: function () {
            this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'grid');
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

