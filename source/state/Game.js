import querystring from 'querystring';

import HeroPlayer from '../player/Hero';
import Pawn from '../pawn/Pawn';
import Pathfinder from '../components/Pathfinder';
import Illuminator from '../components/Illuminator';
import PawnManager from '../components/PawnManager';

export default class {
    constructor () {
        this.store = window.AscensionStore;
        this.store.subscribe(() => this.sync(this.store.getState()));
    }

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
        const {
            user
        } = this.store.getState();

        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.time.advancedTimin = true;
        this.game.time.desiredFps = 30;

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
            blocked: this.tilemap.createLayer('blocked'),
            tagged: this.tilemap.createLayer('tagged')
        };

        /*
        this.grid = this.game.add.tileSprite(
            -1,
            -1,
            this.tilemap.widthInPixels + 1,
            this.tilemap.heightInPixels + 1,
            'grid'
        );
        this.grid.tint = 0x1e1e1e;
        */

        this.layers.blocked.enableBody = true;

        this.Pathfinder = new Pathfinder({
            game: this.game
        });

        const {
            x,
            y
        } = querystring.parse(window.location.search.substr(1));

        this.blockedTiles = this.game.add.group();
        getLayerObjects({
            layer: 'blocked',
            map: this.tilemap
        })
            .map(element => createFromObject(element, this.blockedTiles));

        this.pawnManager = new PawnManager({
            game: this.game,
            store: this.store
        });

        this.pawnManager.add({
            owner: user.session,
            position: {
                x: parseInt(x, 10),
                y: parseInt(y, 10)
            },
            maxHealth: 100,
            currentHealth: 100,
            sync: true
        });

        this.illuminator = new Illuminator({
            game: this.game,
            blocked: this.blockedTiles,
            pawns: this.pawnManager.get()
        });
    }

    sync = ({
        playerActions: {
            isAttacking
        }
    }) => {
        this.isAttacking = isAttacking;
    }

    render () {
        this.game.debug.cameraInfo(this.game.camera, 32, 32);
    }

    update = () => {
        const {
            children: [
                target
            ]
        } = this.pawnManager.get();

        this.illuminator.update({
            target: {
                x: target.position.x + (target.width / 2),
                y: target.position.y + (target.height / 2)
            }
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
