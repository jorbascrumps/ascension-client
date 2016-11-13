export default class extends Phaser.Camera {
    constructor ({ game, ...options } = {}) {
        super(game, 1, 0, 0, 50, 50);

        // this._game = game;
        // this._cursors = this.game.input.keyboard.createCursorKeys();
    }

    // update () {
    //     const {
    //         up: {
    //             isDown: panUp
    //         },
    //         down: {
    //             isDown: panDown
    //         },
    //         left: {
    //             isDown: panLeft
    //         },
    //         right: {
    //             isDown: panRight
    //         }
    //     } = this._cursors;
    //
    //     if (panUp) {
    //         this.game.camera.y -= 8;
    //     } else if (panDown) {
    //         this.game.camera.y += 8;
    //     }
    //
    //     if (panRight) {
    //         this.game.camera.x += 8;
    //     } else if (panLeft) {
    //         this.game.camera.x -= 8;
    //     }
    // }
}
