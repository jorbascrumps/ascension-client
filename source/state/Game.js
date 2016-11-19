import Camera from '../components/Camera';

const TILE_SIZE = {
    HEIGHT: 50,
    WIDTH: 50
}

export default class {
    preload () {
        this.game.stage.backgroundColor = 0x0e1718;

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
