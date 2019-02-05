import State from './State';

export default class RestorationState extends State {

    onEnter() {
        super.onEnter();

        this.target.on('pointerdown', this.onPointerDown, this);

        this.tween = this.target.scene.tweens.add({
            targets: this.target.sprite,
            alpha: 0.5,
            duration: 750,
            repeat: -1,
            yoyo: true
        });
    }

    onExit() {
        super.onExit();

        this.target.off('pointerdown', this.onPointerDown, this);

        this.tween.stop();
        this.target.sprite.setAlpha(1);
    }

    onPointerDown () {
        this.target.activate();
    }

}
