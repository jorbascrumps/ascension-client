import Camera from '../components/Camera';

const TILE_SIZE = {
    HEIGHT: 50,
    WIDTH: 50
}

export default class {
    preload () {
        const gridData = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAGUExURf///////1V89WwAAAACdFJOU/8A5bcwSgAAACZJREFUeNrsy6EBAAAIA6D5/9PeMIsFOsnBtBRFURRFUZTfsgIMAM7aCWItTDiIAAAAAElFTkSuQmCC';
        const background = new Image();

        background.src = gridData;
        this.game.cache.addImage('grid', gridData, background);
        this.game.stage.backgroundColor = 0x0e1718;

        this.load.image('background', 'source/assets/scene/star_field.png');

        this.game.kineticScrolling = this.game.plugins.add(Phaser.Plugin.KineticScrolling);
        this.game.kineticScrolling.configure({
            kineticMovement: false,
            verticalScroll: true,
            horizontalScroll: true,
            verticalWheel: false,
            horizontalWheel: false
        });
    }

    create () {
        const mapWidth = TILE_SIZE.WIDTH * 15 + 1;
        const mapHeight = TILE_SIZE.HEIGHT * 17 + 1;

        this.game.world.setBounds(
            0,
            0,
            mapWidth,
            mapHeight
        );
        this.game.kineticScrolling.start();

        this._background = this.game.add.tileSprite(
            0,
            0,
            mapWidth,
            mapHeight,
            'background'
        );

        this._grid = this.game.add.tileSprite(
            0,
            0,
            mapWidth,
            mapHeight,
            'grid'
        );
    }
}
