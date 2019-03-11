// https://phaser.io/examples/v2/bitmapdata/draw-sprite
// https://phaser.io/phaser3/devlog/99

import FOVLayer from '../components/FOVLayer';

export const key = 'LEVEL';

let controls;
export function update (time, delta) {
    const player = this.pawnManager.get('isActive', true);
    const camera = this.cameras.main;

    if (player && !this.registry.get('settings').disableFog) {
        this.fov.update(
            new Phaser.Math.Vector2({
                x: this.mapManager.mapLayer.worldToTileX(player.x),
                y: this.mapManager.mapLayer.worldToTileY(player.y),
            }),
            new Phaser.Geom.Rectangle(
                this.mapManager.mapLayer.worldToTileX(camera.worldView.x) - 1,
                this.mapManager.mapLayer.worldToTileY(camera.worldView.y) - 1,
                this.mapManager.mapLayer.worldToTileX(camera.worldView.width) + 2,
                this.mapManager.mapLayer.worldToTileX(camera.worldView.height) + 2
            ),
            delta,
        );
    }

    controls && controls.update(delta);

    if (this.background) {
        this.background.setTilePosition(
            -this.cameras.main.scrollX / 100,
            -this.cameras.main.scrollY / 100
        );
    }
}

export async function create () {
    this.tweens.timeScale = this.registry.get('settings').animationSpeed;

    this.background = this.add.tileSprite(0, 0, this.sys.game.config.width + 20, this.sys.game.config.height + 20, 'background')
        .setOrigin(0, 0)
        .setScrollFactor(0);

    const mapHeight = 30;
    const mapWidth = 30;

    const mapData = this.registry.get('levelData');
    this.mapManager = this.add.map(mapData.width, mapData.height, mapData.rooms);

    this.blockedLayer = this.mapManager.blockedLayer;
    this.interactionsLayer = this.mapManager.interactionsLayer;

    if (!this.registry.get('settings').disableFog) {
        this.make.graphics({
            add: false,
            x: 0,
            y: 0,
        })
            .fillStyle(0x000000)
            .fillRect(0, 0, 50, 50)
            .generateTexture('fov');
        this.fov = new FOVLayer(this, this.mapManager.mapLayer, this.mapManager.blockedLayer, 'fov');
    }

    this.goreLayer = this.add.renderTexture(0, 0, 800, 600);

    this.pathfinder.start(this.mapManager.walkable, this.mapManager.blocked, mapWidth);
    this.pawnManager.start(this.server.client, this.pathfinder);

    const cameraCentreX = -((mapWidth * 50) - (mapWidth * 50 / 2));
    const cameraCentreY = -((mapHeight * 50) - (mapHeight * 50 / 2));
    this.cameras.main
        .setBounds(cameraCentreX, cameraCentreY, mapWidth * 50 * 2, mapHeight * 50 * 2, true);

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
    })

    this.server.subscribe(this.mapManager.sync);

    this.server.subscribe(updateRegistryData, this);
    updateRegistryData.call(this, this.server.client.store.getState());

    this.events.on('PAWN_DESTROY', onPawnDeath, this);

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
}

function updateRegistryData ({ ctx, G }, unsubscribe) {
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

    this.registry.set('levelData', G.map);
}

function onPawnDeath (pawn) {
    return this.goreLayer.draw(
        'blood',
        pawn.x,
        pawn.y
    );
}
