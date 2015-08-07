'use strict';

define(['phaser', 'state/Game', 'component/Event'], function (Phaser, Game, Event) {
    function Pawn (game, group, options) {
        Phaser.Sprite.call(
            this,
            game,
            options.transform.position.x,
            options.transform.position.y,
            options.asset
        );

        group.add(this);

        this._id = options.id;
        this._game = game;
        this._graphics = this._game.add.sprite(0, 0);
        this._moving = false;
        this._tracing = false;
        this._trigger_tag = false;

        // Setup graphics object for drawing UI elememts for this pawn
        this._tile_traces = game.add.group();
        this._tile_collisions = game.add.group();

        // Physics settings
        this._game.physics.arcade.enable(this);
        this.body.setSize(50, 50, 0, 0);
        this.body.moves = false;

        this._setupEvents();
        this._traceAdjacentTiles();

        var self = this;
        this._event = Event;
        this._event.on('game.update', function (game_state) {
            self._update.apply(self, [
                game_state.collision_group,
                game_state.map_blocked_tiles,
                game_state.map_tagged_tiles
            ]);
        });
        this._event.on('pawn.tagged.enter', function () {
            self._trigger_tag = true;
            console.warn('Entering [TAGGED] tile');
        })
        this._event.on('pawn.tagged.exit', function () {
            self._trigger_tag = false;
            console.warn('Exiting [TAGGED] tile');
        })
    }

    Pawn.prototype = Object.create(Phaser.Sprite.prototype);
    Pawn.prototype.constructor = Pawn;

    Pawn.prototype._setupEvents = function () {
        this.inputEnabled = true;
        this.input.useHandCursor = true;

        this.events.onInputOver.add(this._mouseOver, this);
        this.events.onInputOut.add(this._mouseOut, this);
        this.events.onKilled.add(this._kill, this);
    };

    Pawn.prototype._mouseOver = function () {};

    Pawn.prototype._mouseOut = function () {};

    Pawn.prototype._update = function () {
        // console.warn('Default [%s] update. You might want to consider overriding this.', this.constructor.name);
    };

    Pawn.prototype._moveTo = function (position, sync) {
        this._clearTrace();

        var new_pos = {
                x: position.x - (position.x % 50),
                y: position.y - (position.y % 50)
            },
            line = new Phaser.Line(
                this.x,
                this.y,
                new_pos.x,
                new_pos.y
            ),
            length = Math.floor(line.length),
            movement_duration = (length - (length % 50)) * 10;

        if (sync) {
            Event.emit('game.pawn.movement', {
                id: this._id,
                position: position
            }, true);
        }

        this._moving = true;
        this.game.add.tween(this)
            .to(new_pos, movement_duration, Phaser.Easing.Linear.None)
            .start()
            .onComplete.add(function (pawn, tween) {
                this._moving = false;
                this._traceAdjacentTiles();
            }, this);
    };

    Pawn.prototype._traceAdjacentTiles = function () {
        this._tracing = true;

        var positions = [
            { x : this.x - 50, y: this.y + 50 }, // bottom left
            { x : this.x - 50, y: this.y      }, // left
            { x : this.x - 50, y: this.y - 50 }, // top left
            { x : this.x,      y: this.y - 50 }, // top
            { x : this.x + 50, y: this.y - 50 }, // top right
            { x : this.x + 50, y: this.y      }, // right
            { x : this.x + 50, y: this.y + 50 }, // bottom right
            { x : this.x,      y: this.y + 50 }  // bottom
        ];

        positions.forEach(this._traceAtPosition, this);
    };

    Pawn.prototype._clearTrace = function () {
        this._tracing = false;
        this._tile_traces.removeChildren();
        this._tile_collisions.removeChildren();
    };

    Pawn.prototype._canMoveToTile = function (tile, pointer) {
        if (tile.valid) {
            this._clearTrace();
            this._moveTo({
                x: pointer.position.x + this._game.camera.x,
                y: pointer.position.y + this._game.camera.y
            }, true);
        }
    };

    Pawn.prototype._traceAtPosition = function (position, index) {
        var sprite = this._tile_collisions.create(position.x, position.y);
        sprite.valid = true;
        sprite.height = 50;
        sprite.width = 50;
        sprite.inputEnabled = true;
        sprite.events.onInputDown.add(this._canMoveToTile, this);
        this._game.physics.arcade.enable(sprite);
        this._tile_collisions.add(sprite);

        var square = this._game.add.graphics();
        square.beginFill(0x00ff00, 0.5);
        square.lineStyle(1, 0x00ff00, 1);
        square.drawRect(position.x + 1, position.y + 1, 48, 48);
        this._tile_traces.addChild(square);
    };

    Pawn.prototype._kill = function () {
        this._clearTrace();
    };

    return Pawn;
});
