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
            var grid_data = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAARUlEQVR42u3PsQ0AAAjDsP7/NEh8UeQM2Z15Um7lgYCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtEA+tJyODR6OptJ5AAAAAElFTkSuQmCC',
                background = new Image();

            background.src = grid_data;
            this.game.cache.addImage('grid', grid_data, background);
            this.game.stage.backgroundColor = 0x0e1718;

            this.load.image('nathan', 'image/pawn/nathan.png');

            this.load.image('tile', 'image/tile/tile.png');
            this.load.image('tile2', 'image/tile/tile2.png');
            this.load.image('tile3', 'image/tile/tile3.png');
            this.load.physics('tile3_physics', 'data/tile/tile3.json');

            this.load.tilemap('tilemap', 'data/map/source/collision_test.json', null, Phaser.Tilemap.TILED_JSON);
            this.load.image('map_image', 'image/tile/level01.png');
        },

        create: function () {
            this._cursors = this.game.input.keyboard.createCursorKeys();
            this._cursors.w = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
            this._cursors.s = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
            this._cursors.a = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
            this._cursors.d = this.game.input.keyboard.addKey(Phaser.Keyboard.D);

            this._camera = new Camera(this.game);
            this.game.add.tileSprite(0, 0, this.game.world.bounds.width, this.game.world.bounds.height, 'grid');
            this.game.world.setBounds(-1000, -1000, 2000, 2000);
            this.game.add.tileSprite(-1000, -1000, this.game.world.bounds.width * 2, this.game.world.bounds.height * 2, 'grid');

            this.tilemap = this.game.add.tilemap('tilemap');
            this.tilemap.addTilesetImage('level', 'map_image', 50, 50);
            this.map_layer = this.tilemap.createLayer('map');

            this.collision_group = this.game.add.group();
            this.collisions = this.getCollisionSprites('collision', this.collision_group);

            this._pawns = this.game.add.group();
            this._hero = new Hero(this.game, this._pawns, {
                "asset": "nathan",
                "transform": {
                    "position": {
                        "x": 150,
                        "y": 150
                    },
                    "rotation": 1,
                    "width": 50,
                    "height": 50
                }
            });

            this.game.input.onDown.add(function (pointer, event) {
                this._hero._moveTo(pointer.position);
            }, this);
        },

        getCollisionSprites: function (layer, group, tileX, tileY) {
            tileX = tileX || 0;
            tileY = tileY || 0;

            var self = this;
            var result = [];
            var sprite;

            this.tilemap.objects[layer].forEach(function(element) {
                element.y -= self.tilemap.tileHeight;
                sprite = group.create(element.x + tileX*50, element.y + tileY*50);
                self.game.physics.arcade.enable(sprite);
                sprite.body.setSize(parseInt(element.properties.width, 10), parseInt(element.properties.height, 10));
                sprite.body.immovable = true;
                result.push(sprite);
            });

            return result;
        },

        render: function () {
            this.game.debug.cameraInfo(this.game.camera, 10, 20);
        },

        update: function () {
            this._camera.update();

            if (this._cursors.w.isDown) {
                this._hero.body.velocity.y -= 8;
            } else if (this._cursors.s.isDown) {
                this._hero.body.velocity.y += 8;
            }

            if (this._cursors.d.isDown) {
                this._hero.body.velocity.x += 8;
            } else if (this._cursors.a.isDown) {
                this._hero.body.velocity.x -= 8;
            }

            this.game.physics.arcade.collide(this._hero, this.collisions, function (origin, target) {
                console.log('colliding');
            }, null, this);
        }
    }

    return Game;
});

