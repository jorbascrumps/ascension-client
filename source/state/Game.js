import querystring from 'querystring';

import HeroPlayer from '../player/Hero';
import Pawn from '../pawn/Pawn';
import Pathfinder from '../components/Pathfinder';
import Illuminator from '../components/Illuminator';

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

        this.store = window.AscensionStore;

        this.Pathfinder = new Pathfinder({
            game: this.game
        });

        const {
            x,
            y
        } = querystring.parse(window.location.search.substr(1));

        this.pawns = this.game.add.group(undefined, 'pawns');
        new Pawn({
            group: this.pawns,
            asset: 'player_pawn',
            position: {
                x: parseInt(x, 10),
                y: parseInt(y, 10)
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
            blocked: this.blockedTiles,
            pawns: this.pawns
        });

        this.syncPawns();
        this.store.subscribe(this.syncPawns);
    }

    render () {
        this.game.debug.cameraInfo(this.game.camera, 32, 32);
    }

    syncPawns = () => {
        const {
            pawn
        } = this.store.getState();

        const newIds = Object.keys(pawn);
        const oldIds = this.pawns.children
            .map(p => p.id);

        const t = this.pawns.children
            .filter(({ id }) => newIds.indexOf(id) < 0)
            .forEach(pawn => this.pawns.remove(pawn, true));

        const newPawns = newIds
            .filter(id => oldIds.indexOf(id) < 0)
            .map(id => pawn[id])
            .map(({
                id,
                position
            }) => new Pawn({
                id,
                group: this.pawns,
                asset: 'player_pawn',
                position,
                sync: false
            }));
    }

    update = () => {
        const target = this.pawns.children[0];
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
