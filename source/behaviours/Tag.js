import State from './State';

export default class TagState extends State {

    onEnter() {
        super.onEnter();

        this.target.sprite.setTint(0xffff00);

        this.graphics.lineStyle(5, 0xffff00, 1);

        const xOffset = 25;
        const yOffset = 25;

        const topLeftCornerSpline = new Phaser.Curves.Spline([
            new Phaser.Math.Vector2(xOffset - 25, yOffset - 10),
            new Phaser.Math.Vector2(xOffset - 25, yOffset - 20),
            new Phaser.Math.Vector2(xOffset - 20, yOffset - 25),
            new Phaser.Math.Vector2(xOffset - 10, yOffset - 25)
        ]);
        topLeftCornerSpline.draw(this.graphics, 5);

        const bottomLeftCornerSpline = new Phaser.Curves.Spline([
            new Phaser.Math.Vector2(xOffset - 25, yOffset + 10),
            new Phaser.Math.Vector2(xOffset - 25, yOffset + 20),
            new Phaser.Math.Vector2(xOffset - 20, yOffset + 25),
            new Phaser.Math.Vector2(xOffset - 10, yOffset + 25)
        ]);
        bottomLeftCornerSpline.draw(this.graphics, 5);

        const topRightCornerSpline = new Phaser.Curves.Spline([
            new Phaser.Math.Vector2(xOffset + 25, yOffset - 10),
            new Phaser.Math.Vector2(xOffset + 25, yOffset - 20),
            new Phaser.Math.Vector2(xOffset + 20, yOffset - 25),
            new Phaser.Math.Vector2(xOffset + 10, yOffset - 25)
        ]);
        topRightCornerSpline.draw(this.graphics, 5);

        const bottomRightCornerSpline = new Phaser.Curves.Spline([
            new Phaser.Math.Vector2(xOffset + 25, yOffset + 10),
            new Phaser.Math.Vector2(xOffset + 25, yOffset + 20),
            new Phaser.Math.Vector2(xOffset + 20, yOffset + 25),
            new Phaser.Math.Vector2(xOffset + 10, yOffset + 25)
        ]);
        bottomRightCornerSpline.draw(this.graphics, 5);

        this.target.scene.input.on('pointermove', this.onPointerMove, this);
        this.target.scene.input.on('pointerdown', this.onPointerDown, this);
    }

    onExit() {
        super.onExit();

        this.target.sprite.clearTint();

        this.graphics.clear();

        this.target.scene.input.off('pointermove', this.onPointerMove, this);
        this.target.scene.input.off('pointerdown', this.onPointerDown, this);
    }

    onPointerMove ({
        worldX: x = 0,
        worldY: y = 0,
    } = {}) {
        this.graphics.setPosition(Math.floor(x / 50) * 50, Math.floor(y / 50) * 50);
    }

    onPointerDown ({
        worldX = 0,
        worldY = 0,
    } = {}) {
        const x = Math.floor(worldX / 50) * 50;
        const y = Math.floor(worldY / 50) * 50;

        return this.target.scene.server.client.moves.tag({ x, y });
    }

}
