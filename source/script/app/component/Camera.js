'use strict';

define(['phaser', 'component/Event'], function (Phaser, Event) {
    function Camera (game, options) {
        this._game = game;
        this._cursors = this._game.input.keyboard.createCursorKeys();

        var self = this;
        Event.on('game.update', function () {
            self.update();
        });
    }

    Camera.prototype = Object.create(Phaser.Camera.prototype);
    Camera.prototype.constructor = Camera;

    Camera.prototype.update = function () {
        if (this._cursors.up.isDown) {
            this._game.camera.y -= 8;
        } else if (this._cursors.down.isDown) {
            this._game.camera.y += 8;
        }

        if (this._cursors.right.isDown) {
            this._game.camera.x += 8;
        } else if (this._cursors.left.isDown) {
            this._game.camera.x -= 8;
        }
    }

    return Camera;
});
