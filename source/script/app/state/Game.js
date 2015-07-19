'use strict';

define(['phaser', 'component/Tile', 'component/Camera', 'component/Hero'], function (Phaser, Tile, Camera, Hero) {
    function Game () {
        this._cursor_position;
        this._player;
        this._tiles;
        this._camera;
        this._pawns;
        this._hero;
    }

    Game.prototype = {
        preload: function () {
            var grid_data = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABHNCSVQICAgIfAhkiAAAAFFJREFUWIXtzjERACAQBDFgMPOKzr8ScADFFlBsFKRX1WqfStLG68SNQcogZZAySBmkDFIGKYOUQcogZZAySBmkDFIGKYOUQcog9X1wJnl9ONrTcwPWLGFOywAAAABJRU5ErkJggg==',
                background = new Image();

            background.src = grid_data;
            this.game.cache.addImage('grid', grid_data, background);

            this.load.image('nathan', 'image/pawn/nathan.png');

            this.load.image('tile', 'image/tile/tile.png');
            this.load.image('tile2', 'image/tile/tile2.png');
            this.load.image('tile3', 'image/tile/tile3.png');
            this.load.physics('tile3_physics', 'data/tile/tile3.json');

            this.load.text('level', 'data/level.json');
        },

        create: function () {
            this.game.physics.startSystem(Phaser.Physics.P2JS);

            this._camera = new Camera(this.game);
            this.game.world.setBounds(-1000, -1000, 2000, 2000);
            this.game.add.tileSprite(-1000, -1000, this.game.world.bounds.width * 2, this.game.world.bounds.height * 2, 'grid');
            this._spawnTiles();

            this._pawns = this.game.add.group();
            this._hero = new Hero(this.game, this._pawns, {
                "asset": "nathan",
                "transform": {
                    "position": {
                        "x": 160,
                        "y": 160
                    },
                    "rotation": 1,
                    "width": 40,
                    "height": 40
                }
            });
        },

        render: function () {
            this.game.debug.cameraInfo(this.game.camera, 32, 32);
        },

        update: function () {
            this._camera.update();
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

