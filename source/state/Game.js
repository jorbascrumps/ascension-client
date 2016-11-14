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

        this.game.load.tilemap('level01', 'source/data/map/level01.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('map_image', 'source/assets/tile/level01.png');

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
        this.tilemap = this.game.add.tilemap('level01');

        const mapWidth = TILE_SIZE.WIDTH * 15 + 1;
        const mapHeight = TILE_SIZE.HEIGHT * 17 + 1;

        this.game.world.setBounds(
            0,
            0,
            this.tilemap.widthInPixels + 1,
            this.tilemap.heightInPixels + 1
        );
        this.game.kineticScrolling.start();

        this._background = this.game.add.tileSprite(
            0,
            0,
            this.tilemap.widthInPixels + 1,
            this.tilemap.heightInPixels + 1,
            'background'
        );

        this._grid = this.game.add.tileSprite(
            0,
            0,
            this.tilemap.widthInPixels + 1,
            this.tilemap.heightInPixels + 1,
            'grid'
        );

        this.tilemap.addTilesetImage('level01', 'map_image', 50, 50);
        this.map_layer = this.tilemap.createLayer('map');
    }
}
