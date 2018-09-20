// https://phaser.io/examples/v2/bitmapdata/draw-sprite
// https://phaser.io/phaser3/devlog/99

import union from 'lodash/unionWith';

export const key = 'LEVEL';

let controls;

export function update (time, delta) {
    this.background &&
        this.background.setTilePosition(-this.cameras.main.scrollX / 50, -this.cameras.main.scrollY / 50);
    controls && controls.update(delta);

    this.fogGraphic
        .clear()
        // .fillStyle(0x000000, .5)
        // .fillRect(0, 0, this.mapManager.width / 2, this.mapManager.height);

    // this.fogGraphic.beginPath();
    // this.mapManager.mapLayer.forEachTile(maskTile, this);
    // this.mapManager.blockedLayer.forEachTile(maskTile, this);

    // const walkableLayer = this.mapManager.mapLayer.forEachTile(maskTile, this, undefined, undefined, undefined, undefined, {
    //     isNotEmpty: true
    // });
    // const blockedLayer = this.mapManager.blockedLayer.forEachTile(maskTile, this, undefined, undefined, undefined, undefined, {
    //     isNotEmpty: true
    // });
    // union(walkableLayer, blockedLayer).forEach(maskTile, this);

    // this.fogGraphic.beginPath();
    // this.pawnManager.getAll('ownedByPlayer', true)
    //     .forEach(({ lightRadius, x, y }) => {
    //         this.fogCircle.setPosition(x + 25, y + 25);
    //         this.fogCircle.radius = lightRadius * 50;
    //
    //         const walkable = this.mapManager.mapLayer.getTilesWithinShape(this.fogCircle, {
    //             isNotEmpty: true
    //         });
    //         const blocked = this.mapManager.blockedLayer.getTilesWithinShape(this.fogCircle, {
    //             isNotEmpty: true
    //         });
    //
    //         const merged = union(walkable, blocked)
    //         walkable.forEach(tile => applyFogOpacity.call(this, tile, x, y, lightRadius));
    //     });
}

function maskTile ({
    height,
    index,
    width,
    x,
    y
} = {}) {
    if (index === -1) {
        return;
    }

    this.fogGraphic
        .fillStyle(0x000000, 0.75)
        .fillRect(x * width, y * height, width, height);
}

function applyFogOpacity (tile, x = 0, y = 0, radius = 1) {
    const distance =
        Phaser.Math.Clamp(
            Math.max(Math.abs(x - tile.x * 50), Math.abs(y - tile.y * 50)) / 50 - 2,
            0,
            radius
        )
    ;
    const alpha = 1 - distance / radius;
    // tile.alpha = 1

    this.fogGraphic
        .fillStyle(0x000000, .5)
        .fillRect(tile.x * tile.width, tile.y * tile.height, tile.width, tile.height);
}

export async function create () {
    const {
        store: {
            getState,
            subscribe
        }
    } = window.client;

    this.events.on('transitionstart', (fromScene, duration) =>
        this.tweens.add({
            targets: this.cameras.main,
            duration,
            alpha: 1,
            onStart: (tween, [ target ]) => {
                target.alpha = 0;
            },
            onComplete: () => {
                this.scene.launch('UI');
            }
        })
    );

    this.background = this.add.tileSprite(0, 0, this.sys.game.config.width + 20, this.sys.game.config.height + 20, 'background')
        .setOrigin(0, 0)
        .setScrollFactor(0);

    const mapHeight = 30;
    const mapWidth = 30;

    this.mapManager.init(mapHeight, mapWidth);
    this.blockedLayer = this.mapManager.blockedLayer;
    this.interactionsLayer = this.mapManager.interactionsLayer;

    this.goreLayer = this.add.renderTexture(0, 0, 800, 600);
    this.fogGraphicLayer = this.add.renderTexture(0, 0, mapWidth * 50, mapHeight * 50)
        .fill('rgb(0, 0, 0)', 0.5);
    this.fogGraphic = this.add.graphics(0, 0)
        // .setVisible(false);
    this.fogCircle = new Phaser.Geom.Circle(275, 275, 525);

    this.pathfinder.start(this.mapManager.walkable, this.mapManager.blocked, mapWidth);
    this.pawnManager.start(window.client, this.pathfinder);

    this.fogGraphic
        .fillStyle(0x000000)
        .beginPath()
        .fillRect(0, 0, 500, 500)
    this.fogGraphicLayer.setMask(this.fogGraphic.createGeometryMask())
    // this.fogGraphicLayer.mask = new Phaser.Display.Masks.GeometryMask(this, this.fogGraphic);
    this.fogGraphicLayer.mask.invertAlpha = true;

    const cameraCentreX = -(window.innerWidth - (mapWidth * 50 / 2));
    const cameraCentreY = -(window.innerHeight - (mapHeight * 50 / 2));
    this.cameras.main
        .setBounds(cameraCentreX, cameraCentreY, window.innerWidth * 2, window.innerHeight * 2, true);

    const cameraPanControls = this.input.keyboard.addKeys({
        up: 'W',
        right: 'D',
        down: 'S',
        left: 'A'
    });
    controls = new Phaser.Cameras.Controls.SmoothedKeyControl({
        ...cameraPanControls,
        camera: this.cameras.main,
        maxSpeed: 1.0,
        acceleration: 1,
        drag: .055
    });

    const unsubscribe = subscribe(() => {
        const {
            ctx
        } = getState();
        const {
            player,
            phase
        } = this.registry.getAll();

        if (ctx.gameover) {
            unsubscribe();
            this.scene.stop('UI');
            return this.scene.start('GAMEOVER', {
                isWinner: ctx.gameover.winner === player.id
            });
        }

        if (phase !== ctx.phase) {
            this.registry.set('phase', ctx.phase);
        }

        this.registry.set('player', {
            ...player,
            isCurrentTurn: player.id === ctx.currentPlayer
        });
    });

    this.events.on('PAWN_DESTROY', onPawnDeath, this);

    this.events.on('resize', resize, this);
}

function onPawnDeath (pawn) {
    return this.goreLayer.draw(
        'blood',
        pawn.x,
        pawn.y
    );
}

function resize (width, height) {
    this.cameras.resize(width, height);
    this.background.setSize(width, height);
}
