// https://phaser.io/examples/v2/bitmapdata/draw-sprite
// https://phaser.io/phaser3/devlog/99

import qs from 'querystring';
import Pathfinder from '../components/Pathfinder';
import PawnManager from '../components/PawnManager';

let controls;
let pathfinder;
let graphics;
let navPath = [];
let sprite;
let busy = false;

export function preload () {
    this.load.tilemapTiledJSON('map', '/source/data/map/level_01.json');
    this.load.image('tiles', '/source/assets/tile/level01.png');
    this.load.image('player', '/source/assets/pawn/nathan.png');
}

export function update (time, delta) {
    // controls.update(delta);

    renderNavPath();
}

function updateNavPath ({
    x,
    y
} = {}) {
    navPath = pathfinder.calculatePath({
        start: {
            x: navPathToWorldCoord(Math.floor(sprite.x / 50)),
            y: navPathToWorldCoord(Math.floor(sprite.y / 50))
        },
        end: {
            x,
            y
        }
    });
}

export function create () {
    const {
        room,
        x = 50,
        y = 50
    } = qs.parse(window.location.search.substr(1));
    const store = window.AscensionStore || {
        getState: () => ({ user: {} }),
        subscribe: () => {},
        dispatch: () => {}
    };

    const {
        user
    } = store.getState();

    const pawnManager = new PawnManager({
        scene: this,
        store
    });

    const tilemap = this.make.tilemap({
        key: 'map'
    });
    const tileset = tilemap.addTilesetImage('level01', 'tiles');
    const levelData = tilemap.createStaticLayer('map', tileset);
    const blockedLayer = tilemap.createStaticLayer('blocked', tileset);

    sprite = pawnManager.add({
        owner: user.session,
        position: {
            x: parseInt(x, 10),
            y: parseInt(y, 10)
        },
        sync: true
    });

    pathfinder = new Pathfinder({
        tilesPerRow: tilemap.width,
        map: levelData.layer.data,
        blocked: blockedLayer.layer.data
    });
    graphics = this.add.graphics(0, 0);

    /*
    const cursors = this.input.keyboard.createCursorKeys();
    controls = this.cameras.addKeyControl({
        camera: this.cameras.main,
        left: cursors.left,
        right: cursors.right,
        up: cursors.up,
        down: cursors.down,
        speed: 0.5
    });
    this.cameras.main.setBounds(10, 0, 25, 25);
    */

    this.input.on('pointermove', ({ x, y }) => updateNavPath({ x, y }));

    this.input.on('pointerdown', () => {
        const path = navPath.map(({ x, y }) => ({
            x: navPathToWorldCoord(x),
            y: navPathToWorldCoord(y)
        }));

        sprite.moveToPath({
            path,
            sync: true
        });
    });
}

function renderNavPath () {
    graphics.clear();

    if (busy || navPath.length <= 0) {
        return;
    }

    const navPoints = [
        new Phaser.Math.Vector2(sprite.x + 25, sprite.y + 25),
        ...navPath
            .map(({ x, y }) => new Phaser.Math.Vector2(
                navPathToWorldCoord(x) + 25,
                navPathToWorldCoord(y) + 25
            ))
    ];

    const lineColor = navPath.length > 4 ? 0xff0000 : 0x00ff00;
    graphics.lineStyle(4, lineColor, .5);

    const curve = new Phaser.Curves.Spline(navPoints);
    curve.draw(graphics, 64);
}

function navPathToWorldCoord (coord) {
    return coord * 50;
}
