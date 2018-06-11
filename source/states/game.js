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
import gameConfig from '../../../game';

let controls;
let pathfinder;
let sprite;
let busy = false;

export function preload () {
    this.load.tilemapTiledJSON('map', '/client/source/data/map/level_01.json');
    this.load.image('tiles', '/client/source/assets/tile/level01.png');
    this.load.image('player', '/client/source/assets/pawn/skeleton.png');
    this.load.image('blood', '/client/source/assets/blood.png');

    this.load.on('progress', value =>
        FBInstant.setLoadingProgress(value * 100)
    );
}

export function update (time, delta) {}

export async function create () {
    await FBInstant.startGameAsync();

    const playerID = FBInstant.player.getID();
    const {
        room,
        x = 50,
        y = 50
    } = qs.parse(window.location.search.substr(1));

    this.client = c.Client({
        game: b.Game(gameConfig),
        multiplayer: {
            server: 'localhost:8080'
        },
        gameID: room,
        playerID
    });
    this.client.connect();

    const tilemap = this.make.tilemap({
        key: 'map'
    });

    const tileset = tilemap.addTilesetImage('level01', 'tiles');
    const levelData = tilemap.createStaticLayer('map', tileset);
    const blockedLayer = tilemap.createStaticLayer('blocked', tileset);

    this.renderTex = this.add.renderTexture(0, 0, 800, 600);
    this.blood = this.add.sprite(0, 0, 'blood').setVisible(false);

    pathfinder = Pathfinder.init({
        tilesPerRow: tilemap.width,
        map: levelData.layer.data,
        blocked: blockedLayer.layer.data
    });
    const pawnManager = new PawnManager({
        scene: this,
        pathfinder,
        client: this.client
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
    this.events.on('PAWN_DESTROY', onPawnDeath, this);
}

function onPawnDeath (pawn) {
    const halfHeight = this.blood.frame.halfHeight;
    const halfWidth = this.blood.frame.halfWidth;

    this.renderTex.save();
    this.renderTex.translate(pawn.x, pawn.y);
    this.renderTex.translate(halfWidth, halfHeight);

    this.renderTex.rotate(Phaser.Math.Between(0, 360) * Phaser.Math.DEG_TO_RAD);
    this.renderTex.draw(
        this.blood.texture,
        this.blood.frame,
        -halfWidth,
        -halfHeight
    );
    this.renderTex.restore();
}
