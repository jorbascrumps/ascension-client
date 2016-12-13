import HeroPlayer from '../player/Hero';
import Pawn from '../pawn/Pawn';

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
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.tilemap = this.game.add.tilemap('level01');

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

        this.grid = this.game.add.tileSprite(
            0,
            0,
            this.tilemap.widthInPixels + 1,
            this.tilemap.heightInPixels + 1,
            'grid'
        );
        this.grid.tint = 0x7a7a7a;

        this.tilemap.addTilesetImage('level01', 'map_image', 50, 50);
        this.tilemap.setCollision([ 1 ]);

        // Game layers
        this.layers = {
            map: this.tilemap.createLayer('map'),
            blocked: this.tilemap.createLayer('blocked')
        };

        this.layers.blocked.enableBody = true;

        this.pawns = this.game.add.group(undefined, 'pawns');
        new Pawn({
            group: this.pawns,
            asset: 'player_pawn',
            position: {
                x: 150,
                y: 150
            }
        });
    }

    render () {
        this.game.debug.cameraInfo(this.game.camera, 32, 32);
    }
}
