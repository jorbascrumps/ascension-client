export default class Button extends Phaser.GameObjects.Container {

    #background

    #label

    constructor (scene, label, x = 0, y = 0) {
        super(scene, x, y);

        this.#label = scene.add.text(0, 0, label.toUpperCase(), {
            fontSize: 20,
            fontFamily: 'Arial'
        })
            .setName('label')
            .setPadding({
                bottom: 14,
                left: 16,
                right: 16,
                top: 16,
            });
        this.#background = scene.add.rectangle(0, 0, this.#label.displayWidth, this.#label.displayHeight, 0x6666ff)
            .setAlpha(0.5)
            .setOrigin(0, 0);

        this.add([
            this.#background,
            this.#label,
        ]);

        this.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(0, 0, this.#label.displayWidth, this.#label.displayHeight),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        });

        this.on('pointerover', this.onPointerOver, this);
        this.on('pointerout', this.onPointerOut, this);
    }

    onPointerOver () {
        this.#background.setAlpha(1);
    }

    onPointerOut () {
        this.#background.setAlpha(0.5);
    }

}
