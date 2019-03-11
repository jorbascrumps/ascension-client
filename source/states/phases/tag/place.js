export const key = 'PLACE';

export function init ({ card }) {
    this.data.set({
        card,
    });
}

export function create () {
    createCursor.call(this);

    this.input.on('pointermove', onPointerMove, this);
    this.input.on('pointerdown', onPointerDown, this);
}

function createCursor () {
    this.cursor = this.add.graphics(0, 0);
    this.cursor.lineStyle(5, 0xffff00, 1);

    const xOffset = 25;
    const yOffset = 25;

    const topLeftCornerSpline = new Phaser.Curves.Spline([
        new Phaser.Math.Vector2(xOffset - 25, yOffset - 10),
        new Phaser.Math.Vector2(xOffset - 25, yOffset - 20),
        new Phaser.Math.Vector2(xOffset - 20, yOffset - 25),
        new Phaser.Math.Vector2(xOffset - 10, yOffset - 25)
    ]);
    topLeftCornerSpline.draw(this.cursor, 5);

    const bottomLeftCornerSpline = new Phaser.Curves.Spline([
        new Phaser.Math.Vector2(xOffset - 25, yOffset + 10),
        new Phaser.Math.Vector2(xOffset - 25, yOffset + 20),
        new Phaser.Math.Vector2(xOffset - 20, yOffset + 25),
        new Phaser.Math.Vector2(xOffset - 10, yOffset + 25)
    ]);
    bottomLeftCornerSpline.draw(this.cursor, 5);

    const topRightCornerSpline = new Phaser.Curves.Spline([
        new Phaser.Math.Vector2(xOffset + 25, yOffset - 10),
        new Phaser.Math.Vector2(xOffset + 25, yOffset - 20),
        new Phaser.Math.Vector2(xOffset + 20, yOffset - 25),
        new Phaser.Math.Vector2(xOffset + 10, yOffset - 25)
    ]);
    topRightCornerSpline.draw(this.cursor, 5);

    const bottomRightCornerSpline = new Phaser.Curves.Spline([
        new Phaser.Math.Vector2(xOffset + 25, yOffset + 10),
        new Phaser.Math.Vector2(xOffset + 25, yOffset + 20),
        new Phaser.Math.Vector2(xOffset + 20, yOffset + 25),
        new Phaser.Math.Vector2(xOffset + 10, yOffset + 25)
    ]);
    bottomRightCornerSpline.draw(this.cursor, 5);
}

function onPointerDown (pointer) {
    const {
        card,
    } = this.data.getAll();
    const level = this.scene.get('LEVEL');
    const position = pointer.positionToCamera(level.cameras.main);

    const x = Math.floor(position.x / 50) * 50;
    const y = Math.floor(position.y / 50) * 50;

    level.server.client.moves.tag(card, {
        x,
        y,
    });

    this.scene.stop();
}

function onPointerMove (pointer) {
    const level = this.scene.get('LEVEL');
    const position = pointer.positionToCamera(level.cameras.main);

    const x = Math.floor(position.x / 50) * 50;
    const y = Math.floor(position.y / 50) * 50;

    this.cursor.setPosition(
        x - level.cameras.main.scrollX,
        y - level.cameras.main.scrollY
    );
}
