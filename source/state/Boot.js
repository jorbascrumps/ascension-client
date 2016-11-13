export default class {
    create () {
        this.input.maxPointers = 1;
        this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.refresh();

        this.state.start('Preload');
    }
}
