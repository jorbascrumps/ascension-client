export default class {
    preload () {
        this.load.image('loader', 'source/assets/loading.svg');
    }

    create () {
        this.game.stage.disableVisibilityChange = true;
        this.input.maxPointers = 1;
        this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.refresh();
    }

    update () {
        this.state.start('Preload');
    }
}
