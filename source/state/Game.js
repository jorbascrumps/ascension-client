import HeroPlayer from '../player/Hero';
import Pawn from '../pawn/Pawn';
import Pathfinder from '../components/Pathfinder';
import Illuminator from '../components/Illuminator';
import configureStore from '../store';

export default class {
    preload () {
        this.game.stage.backgroundColor = 0x0e1718;

        this.game.kineticScrolling = this.game.plugins.add(Phaser.Plugin.KineticScrolling);
        this.game.kineticScrolling.configure({
            kineticMovement: false,
            verticalScroll: true,
            horizontalScroll: true,
            verticalWheel: false,
            horizontalWheel: false,
            modifierKey: Phaser.Keyboard.SPACEBAR
        });
    }

    create () {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.tilemap = this.game.add.tilemap('level');

        this.game.world.setBounds(
            0,
            0,
            this.tilemap.widthInPixels + 1,
            this.tilemap.heightInPixels + 1
        );
        // this.game.kineticScrolling.start();

        this._background = this.game.add.tileSprite(
            0,
            0,
            this.tilemap.widthInPixels + 1,
            this.tilemap.heightInPixels + 1,
            'background'
        );

        this.tilemap.addTilesetImage('level01', 'map_image', 50, 50);
        this.tilemap.setCollision([ 1 ]);

        // Game layers
        this.layers = {
            map: this.tilemap.createLayer('map'),
            blocked: this.tilemap.createLayer('blocked')
        };

        this.grid = this.game.add.tileSprite(
            -1,
            -1,
            this.tilemap.widthInPixels + 1,
            this.tilemap.heightInPixels + 1,
            'grid'
        );
        this.grid.tint = 0x1e1e1e;

        this.layers.blocked.enableBody = true;

        this.store = configureStore();

        this.Pathfinder = new Pathfinder({
            game: this.game
        });

        this.pawns = this.game.add.group(undefined, 'pawns');
        new Pawn({
            group: this.pawns,
            asset: 'player_pawn',
            position: {
                x: 100,
                y: 100
            }
        });

        this.blockedTiles = this.game.add.group();
        getLayerObjects({
            layer: 'blocked',
            map: this.tilemap
        })
            .map(element => createFromObject(element, this.blockedTiles));

        this.illuminator = new Illuminator({
            game: this.game,
            blocked: this.blockedTiles
        });
    }

    render () {
        this.game.debug.cameraInfo(this.game.camera, 32, 32);
    }

    update = () => {
        this.illuminator.update({
            target: this.game.input.activePointer
        });
    }
}

function getLayerObjects ({
    type,
    layer,
    map
} = {}) {
    const {
        objects: {
            [layer]: searchLayer
        }
    } = map;

    if (typeof type === 'undefined') {
        return searchLayer;
    }

    return searchLayer
        .reduce((cache, element) => {
            if (element.type === type) {
                return [
                    ...cache,
                    element
                ];
            }

            return cache;
        }, []);
}

function createFromObject (tile, group) {
    const sprite = group.create(tile.x, tile.y, tile.properties.sprite);
    sprite.alpha = 0;

    Object.keys(tile)
        .forEach(key => sprite[key] = tile[key]);

    return sprite;
}
