'use strict';

define([
    'phaser',
    'component/Tile',
    'component/Camera',
    'component/Hero',
    'component/Pawn',
    'component/Event',
    'component/DataStore',
    'component/PawnManager',
    'util/URL',
    'component/player/Hero',
    'component/player/Overlord'
], function (
    Phaser,
    Tile,
    Camera,
    Hero,
    Pawn,
    Event,
    DataStore,
    PawnManager,
    URL,
    HeroPlayer,
    OverlordPlayer
) {
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

            // Setup grid lines
            var grid_data = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAGUExURf///////1V89WwAAAACdFJOU/8A5bcwSgAAACZJREFUeNrsy6EBAAAIA6D5/9PeMIsFOsnBtBRFURRFUZTfsgIMAM7aCWItTDiIAAAAAElFTkSuQmCC'
              , background = new Image();
            background.src = grid_data;
            this.game.cache.addImage('grid', grid_data, background);
            this.game.stage.backgroundColor = 0x0e1718;

            this.load.image('nathan', 'image/pawn/nathan.png');
            this.load.image('background', 'image/scene/star_field.png');
            this.load.tilemap('tilemap', 'data/map/source/collision_test.json', null, Phaser.Tilemap.TILED_JSON);
            this.load.image('map_image', 'image/tile/level01.png');
        },

        create: function () {
            this.stage.disableVisibilityChange = true;
            this._cursors = this.game.input.keyboard.createCursorKeys();

            this._camera = new Camera(this.game);
            this.game.world.setBounds(
                -this.game.world.bounds.width,
                -this.game.world.bounds.height,
                this.game.world.bounds.width * 2,
                this.game.world.bounds.height * 2
            );

            this._background = this.game.add.tileSprite(
                -this.game.world.bounds.width,
                -this.game.world.bounds.height,
                this.game.world.bounds.width * 2,
                this.game.world.bounds.height * 2,
                'background'
            );

            this._grid = this.game.add.tileSprite(
                0,
                0,
                this.game.world.bounds.width,
                this.game.world.bounds.height,
                'grid'
            );
            this._grid.fixedToCamera = true;
            this._grid.tint = 0x111111;

            this.tilemap = this.game.add.tilemap('tilemap');
            this.tilemap.addTilesetImage('level', 'map_image', 50, 50);
            this.map_layer = this.tilemap.createLayer('map');
            this.map_blocked_tiles = this.tilemap.createLayer('blocked');

            this.collision_group = this.game.add.group();
            this.collisions = this.getCollisionSprites('collision', this.collision_group);

            this._pawns = this.game.add.group(null, 'pawns', true);

            this.map_tagged_tiles = this.tilemap.createLayer('tagged');

            this.line = new Phaser.Line();

            this._blocked_tiles = this.game.add.group();

            var pos = (Math.floor(Math.random() * 6) + 3) * 50;
            Event.emit('game.player.create', {
                room: 1,
                position: {
                    x: 2 * 50,
                    y: pos
                }
            }, true);

            var self = this;
            Event.on('server.pawn.spawn', function (pawn) {
                PawnManager.add(pawn, self._pawns);
            }, true);

            Event.on('server.pawn.kill', function (data) {
                PawnManager.remove(data.id);
            }, true);

            Event.on('server.pawn.movement', function (data) {
                self._pawns.children.forEach(function (pawn) {
                    if (pawn._id == data.id) {
                        pawn._moveTo(data.position, false);

                        return;
                    }
                });
            }, true);

            Event.on('server.tagged.enter', function (payload) {
                console.warn('%s has entered a [TAGGED] tile', payload.id);
            }, true);

            Event.on('server.tagged.exit', function (payload) {
                console.warn('%s has exited a [TAGGED] tile', payload.id);
            }, true);
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
            this.game.debug.geom(this.line);
        },

        update: function () {
            Event.emit('game.update', this);

            // Scroll the grid with the camera
            this._grid.tilePosition.set(
                -this.game.camera.x,
                -this.game.camera.y
            );

            // Scroll the background against the camera to create parallax effect
            this._background.tilePosition.set(
                this.game.camera.x * 0.05,
                this.game.camera.y * 0.05
            );

            this._drawLineOfSight();
        },

        _drawLineOfSight: function () {
            this.line.start.set(0, 0);
            this.line.end.set(
                this.game.input.mousePointer.x + this.game.camera.x,
                this.game.input.mousePointer.y + this.game.camera.y
            );

            this._highlightInvalidTiles();
        },

        _highlightInvalidTiles: function () {

            // Empty group to avoid too much overdraw
            this._blocked_tiles.removeChildren();

            var hits = this.map_blocked_tiles.getRayCastTiles(this.line, 1, false, false),
                filtered_hits = hits.filter(this._filterVisibleTiles);

            filtered_hits.forEach(function (tile, index) {
                var square = this.game.add.graphics();
                square.beginFill(0xff0000, 0.5);
                square.lineStyle(2, 0xff0000, 1);

                if (this._blocked_tiles.getAt(index) < 0) {
                    square.drawRect(tile.worldX + 1, tile.worldY + 1, 48, 48);
                    this._blocked_tiles.addAt(square, index);
                }
            }, this);
        },

        _filterVisibleTiles: function (tile, index) {
            return tile.index >= 0;
        }
    }

    return Game;
});

