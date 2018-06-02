// https://phaser.io/examples/v2/bitmapdata/draw-sprite
// https://phaser.io/phaser3/devlog/99

import qs from 'querystring';
import Pathfinder from '../components/Pathfinder';
import PawnManager from '../components/PawnManager';

import {
    default as c
} from 'boardgame.io/client';
import {
    default as b
} from 'boardgame.io/core';
import gameConfig from '../game';

let controls;
let pathfinder;
let sprite;
let busy = false;

export function preload () {
    this.load.tilemapTiledJSON('map', '/source/data/map/level_01.json');
    this.load.image('tiles', '/source/assets/tile/level01.png');
    this.load.image('player', '/source/assets/pawn/skeleton.png');
}

export function update (time, delta) {}

export function create () {
    const {
        id,
        room,
        x = 50,
        y = 50
    } = qs.parse(window.location.search.substr(1));

    this.client = c.Client({
        game: b.Game(gameConfig(this)),
        multiplayer: {
            server: 'localhost:8080'
        },
        gameID: room,
        playerID: id
    });
    this.client.connect();

    const store = window.AscensionStore || {
        getState: () => ({ user: {} }),
        subscribe: () => {},
        dispatch: () => {}
    };

    const {
        user
    } = store.getState();

    const tilemap = this.make.tilemap({
        key: 'map'
    });
    const tileset = tilemap.addTilesetImage('level01', 'tiles');
    const levelData = tilemap.createStaticLayer('map', tileset);
    const blockedLayer = tilemap.createStaticLayer('blocked', tileset);

    pathfinder = Pathfinder.init({
        tilesPerRow: tilemap.width,
        map: levelData.layer.data,
        blocked: blockedLayer.layer.data
    });
    const pawnManager = new PawnManager({
        scene: this,
        store,
        pathfinder,
        client: this.client
    });
    sprite = pawnManager.add({
        id,
        owner: user.session,
        position: {
            x: parseInt(x, 10),
            y: parseInt(y, 10)
        },
        sync: true
    });
    pawnManager.add({
        id: '123',
        owner: '1',
        position: {
            x: 100,
            y: 200
        }
    });
    pawnManager.add({
        id: '456',
        owner: '1',
        position: {
            x: 150,
            y: 200
        }
    });
    pawnManager.add({
        id: '789',
        owner: '1',
        position: {
            x: 200,
            y: 200
        }
    });

    this.input.on('gameobjectdown', (pointer, target) => {
        if (target.ownedByPlayer) {
            return;
        }

        target.sprite.setTint(0xff0000);
        this.events.emit('ATTACK_REGISTER', target.id);
    });
    this.input.on('gameobjectup', (pointer, target) => {
        target.sprite.setTint(0xe3e3e3);
    });
    this.input.on('gameobjectover', (pointer, target) => {
        target.sprite.setTint(0xe3e3e3);
    });
    this.input.on('gameobjectout', (pointer, target) => {
        target.sprite.clearTint();
    });
}
