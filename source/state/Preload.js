export default class {
    constructor () {
        this.ready = false;
        this.loader;
    }

    preload () {
        this.loader = this.add.sprite(0, 0, 'loader');

        const gridData = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAGUExURf///////1V89WwAAAACdFJOU/8A5bcwSgAAACZJREFUeNrsy6EBAAAIA6D5/9PeMIsFOsnBtBRFURRFUZTfsgIMAM7aCWItTDiIAAAAAElFTkSuQmCC';
        const background = new Image();

        background.src = gridData;
        this.game.cache.addImage('grid', gridData, background);

        this.load.image('background', 'source/assets/scene/star_field.png');
        this.load.image('player_pawn', 'source/assets/pawn/nathan.png');
        this.game.load.tilemap('level02', 'source/data/map/level02.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('map_image', 'source/assets/tile/level01.png');

        this.load.onLoadComplete.add(() => this.ready = true);
    }

    update () {
        if (!this.ready) {
            return;
        }

        this.state.start('Game');
    }
}
