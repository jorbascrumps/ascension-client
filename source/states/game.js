// https://phaser.io/examples/v2/bitmapdata/draw-sprite
// https://phaser.io/phaser3/devlog/99

import qs from 'querystring';

import {
    default as c
} from 'boardgame.io/client';
import {
    default as b
} from 'boardgame.io/core';
import gameConfig from '../../core/common/game';

export const key = 'LEVEL';

let controls;

export function preload () {
    this.load.image('background', '/source/assets/scene/stars.jpg');
    this.load.image('tiles', '/core/common/data/maps/level.png');
    this.load.image('player', '/source/assets/pawn/skeleton.png');
    this.load.image('blood', '/source/assets/blood.png');

    this.load.on('progress', value =>
        FBInstant.setLoadingProgress(value * 100)
    );
}

export function update (time, delta) {
    this.background &&
        this.background.setTilePosition(-this.cameras.main.scrollX / 50, -this.cameras.main.scrollY / 50);
    controls && controls.update(delta);
}

export async function create () {
    await FBInstant.startGameAsync();

    this.scene.launch('UI');

    const playerID = FBInstant.player.getID();
    const {
        room,
        x = 50,
        y = 50
    } = qs.parse(window.location.search.substr(1));

    const game = gameConfig();
    this.client = c.Client({
        game: b.Game(game),
        multiplayer: {
            server: 'localhost:8080'
        },
        gameID: room,
        playerID
    });
    this.client.connect();

    const {
        client: {
            store: {
                getState,
                subscribe
            }
        }
    } = this;

    this.background = this.add.tileSprite(0, 0, this.sys.game.config.width + 20, this.sys.game.config.height + 20, 'background')
        .setOrigin(0, 0)
        .setScrollFactor(0);

    let map;
    let tileset;
    let mapLayer;
    let blockedLayer;
    let interactionsLayer;
    const unsubscribe = subscribe(() => {
        const {
            G
        } = getState();
        const mapHeight = G.map.length;
        const mapWidth = G.map[0].length;

        unsubscribe();

        map = this.make.tilemap({
            height: mapHeight,
            tileHeight: 50,
            tileWidth: 50,
            width: mapWidth,
        });
        tileset = map.addTilesetImage('tiles');
        mapLayer = map
            .createBlankDynamicLayer('map', tileset)
            .putTilesAt(G.map, 0, 0, false);
        blockedLayer = map
            .createBlankDynamicLayer('blocked', tileset)
            .putTilesAt(G.blocked, 0, 0, false);
        interactionsLayer = map
            .createBlankDynamicLayer('interactions', tileset)
            .putTilesAt(G.interactions, 0, 0, false);

        this.pathfinder.start(G.map, G.blocked, map.width);
        this.pawnManager.start(this.client, this.pathfinder);

        const cameraCentreX = -(window.innerWidth - (mapWidth * 50 / 2));
        const cameraCentreY = -(window.innerHeight - (mapHeight * 50 / 2));
        this.cameras.main
            .setBounds(cameraCentreX, cameraCentreY, window.innerWidth * 2, window.innerHeight * 2, true);

        controls = new Phaser.Cameras.Controls.SmoothedKeyControl({
            ...this.input.keyboard.createCursorKeys(),
            camera: this.cameras.main,
            maxSpeed: 1.0,
            acceleration: 1,
            drag: .055
        });
    });
    this.renderTex = this.add.renderTexture(0, 0, 800, 600);
    this.blood = this.add.sprite(0, 0, 'blood').setVisible(false);

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

    this.events.on('resize', resize, this);
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

function resize (width, height) {
    this.cameras.resize(width, height);
    this.background.setSize(width, height);
}
