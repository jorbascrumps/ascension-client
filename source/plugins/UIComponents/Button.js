export default class Button extends Phaser.GameObjects.Container {

    #background

    #label

    constructor (scene, label, x = 0, y = 0) {
        super(scene, x, y);

        this.#label = scene.add.text(0, 0, label.toUpperCase(), {
            fontSize: 16,
            fontFamily: 'Arial'
        })
            .setColor('#fff')
            .setName('label')
            .setPadding({
                bottom: 14,
                left: 16,
                right: 16,
                top: 16,
            });
        this.#background = scene.add.rectangle(0, 0, this.#label.displayWidth, this.#label.displayHeight, 0x71f5a7)
            .setAlpha(0.75)
            .setOrigin(0, 0);

        this.add([
            this.#background,
            this.#label,
        ]);

        this.setInteractive({
            hitArea: this.#background,
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        });

        this.on('pointerover', this.onPointerOver, this);
        this.on('pointerout', this.onPointerOut, this);
        this.on('pointerdown', this.onPointerDown, this);
        this.on('pointerup', this.onPointerUp, this);
    }

    onPointerOver () {
        this.#background.setAlpha(1);
    }

    onPointerOut () {
        this.#background.setAlpha(0.75);
    }

    onPointerDown () {
        Phaser.Actions.SetXY(this.getAll(), 1, 1);
        this.#background.setAlpha(0.75);
    }

    onPointerUp () {
        Phaser.Actions.SetXY(this.getAll(), 0, 0);
        this.#background.setAlpha(1);
    }

}
