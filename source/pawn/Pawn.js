import * as Util from '../components/Util';

export default class extends Phaser.GameObjects.Container {

    constructor ({
        game,
        client,
        pathfinder,
        manager,
        id,
        asset = 'player',
        position: {
            x: initialX = 10,
            y: initialY = 0
        } = {},
        owner,
        maxHealth = 50,
        currentHealth = maxHealth,
        speed = 8
    } = {}) {
        super(game, initialX, initialY);

        game.sys.displayList.add(this);
        game.sys.updateList.add(this);

        this.id = (id || Date.now()).toString();

        this.setDataEnabled();
        this.on('changedata', this.onChangeData);

        // Setup sprite
        this.sprite = game.add.sprite(0, 0, asset);
        this.sprite.setOrigin(-0.25, 0.5);
        this.sprite.setScale(2);
        this.add(this.sprite);

        // Setup health
        this.healthBar = game.add.graphics(0, 0);
        this.add(this.healthBar);

        this.client = client;
        this.pathfinder = pathfinder;
        this.manager = manager;
        this.owner = owner.toString();
        this.ownedByPlayer = this.owner === this.client.playerID;
        this.speed = speed;
        this.busy = false;
        this.isActive = false;
        this.currentPhase = undefined;
        this.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(0, 0, 50, 50),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        });

        // Setup navigation
        this.navPath = [];
        this.navGraphic = game.add.graphics(0, 0);
        this.pathfinder.closeNode({ x: this.x, y: this.y });

        this.unsubscribe = this.client.store.subscribe(() => this.sync(this.client.store.getState()));
        this.sync(this.client.store.getState());

        game.events.on('ATTACK_REGISTER', targetId => {
            if (!this.isActive) {
                return;
            }

            const target = manager.get('id', targetId);
            const isAdjacent = this.pathfinder.isAdjacent(
                { x: this.x, y: this.y },
                { x: target.x, y: target.y }
            );

            if (!isAdjacent) {
                return;
            }

            this.client.moves.attackPawn(this.id, targetId);
        });

        this.on('destroy', this.onDestroy);
    }

    sync = ({
        G: {
            pawns: {
                [this.id]: {
                    active,
                    currentHealth,
                    exhausted,
                    maxHealth,
                    position = {
                        x: this.x,
                        y: this.y
                    }
                }
            }
        },
        ctx: {
            currentPlayer,
            phase
        }
    } = {}) => {
        const turnEnded = this.isActive && exhausted;
        this.isActive = active && currentPlayer === this.owner;

        if (position.x !== this.x || position.y !== this.y) {
            this.moveToPosition(position);
        }

        try {
            this.data.set({
                exhausted,
                currentHealth,
                maxHealth
            });
        } catch (e) {}

        if (this.ownedByPlayer && (phase !== this.currentPhase || turnEnded)) {
            this.currentPhase = phase;
            this.setupPhaseHandlers(phase);
        }
    }

    onChangeData = (_, key, val) => {
        const currentVal = this.data.get(key);

        switch (key) {
            case 'currentHealth':
                return val <= 0 && this.destroy();
        }
    }

    setupPhaseHandlers = phase => {
        const {
            data: {
                values: {
                    exhausted
                }
            }
        } = this;

        this.off('pointerdown', this.activate, this, true);
        this.scene.input.off('pointermove', this.updateNavPath, this);
        this.scene.input.off('pointerdown', this.search, this);

        switch (phase) {
            case 'Restoration':
                !exhausted && this.once('pointerdown', this.activate, this);

                break;
            case 'Movement':
                this.isActive && this.scene.input.once('pointerdown', this.move, this);
                this.isActive && this.scene.input.on('pointermove', this.updateNavPath, this);

                break;
            case 'Search':
                this.isActive && this.scene.input.on('pointerdown', this.search, this);

                break;
        }
    }

    preUpdate (...args) {
        this.update(...args);
    }

    update () {
        this.renderHealthBar();

        this.isActive && this.pathfinder.renderPath(
            this.navPath,
            { x: this.x, y: this.y },
            this.speed
        );
    }

    renderHealthBar = () => {
        this.healthBar.clear();
        this.healthBar.depth = 2;

        const {
            currentHealth,
            maxHealth
        } = this.data.query("Health$");

        const anchorX = 14;
        const anchorY = -26;
        const height = 1;
        const width = 26;
        const per = (currentHealth / maxHealth) * width;

        this.healthBar.fillStyle(0x000000, 1);
        this.healthBar.fillRect(anchorX - 1, anchorY - 1, width + 2, height + 2);
        this.healthBar.fillStyle(0xff0000, 1);
        this.healthBar.fillRect(anchorX, anchorY, per, height);
    }

    updateNavPath = ({
        worldX: x = 0,
        worldY: y = 0
    } = {}) => {
        const {
            client: {
                store: {
                    getState
                }
            }
        } = this;
        const {
            ctx: {
                phase
            }
        } = getState();

        if (phase !== 'Movement' || this.busy || !this.isActive) {
            return;
        }

        this.navPath = this.pathfinder.calculatePath(
            {
                x: Util.navPathToWorldCoord(Math.floor(this.x / 50)),
                y: Util.navPathToWorldCoord(Math.floor(this.y / 50))
            },
            {
                x,
                y
            }
        );
    }

    attack = () => this.client.moves.attackPawn(this.id)

    activate = () => this.client.moves.activatePawn(this.id)

    search = ({ worldX, worldY }) => {
        const target = this.scene.interactionLayer.getTileAtWorldXY(worldX, worldY);

        if (null === target) {
            return alert('Nothing to search!');
        }

        return this.client.moves.searchSpace({
            x: target.pixelX,
            y: target.pixelY
        });
    }

    move = () => {
        if (!this.navPath.length || this.navPath.length > this.speed) {
            return;
        }

        const path = this.navPath.map(({x, y}) => ({
            x: Util.navPathToWorldCoord(x),
            y: Util.navPathToWorldCoord(y)
        }));

        this.moveToPath(path);
    }

    moveToPosition = ({
        x = 0,
        y = 0
    } = {}) => this.scene.tweens.add({
        targets: this,
        ease: 'Power4',
        x,
        y,
        duration: 500,
        onStartParams: [{}],
        onStart: (...args) => {
            this.busy = true;
            this.navPath = [];
            this.onPreMove(...args);
            this.onMoveStart(...args);
        },
        onCompleteParams: [{}],
        onComplete: (...args) => {
            this.busy = false;
            this.onPostMove(...args);
            this.onMoveEnd(...args);
        }
    })

    moveToPath = async (path = []) => {
        for (const pos of path) {
            this.client.moves.movePawn(this.id, pos);
            await Util.wait(750);
        }
    }

    onPreMove = () => this.pathfinder.openNode({
        x: Math.ceil(this.x),
        y: Math.ceil(this.y)
    })

    onMoveStart = ({ data }, [ target ]) => {
        const movement = data.find(({ key }) => key === 'x');

        if (movement.getEndValue() === Math.ceil(this.x)) {
            return;
        }

        this.sprite.flipX = movement.getEndValue() <= Math.ceil(this.x);

        return this;
    }

    onPostMove = () => this.pathfinder.closeNode({
        x: Math.ceil(this.x),
        y: Math.ceil(this.y)
    })

    onMoveEnd = (tween, [ target ]) => {}

    onDestroy = () => {
        this.unsubscribe();

        this.pathfinder.openNode({
            x: this.x,
            y: this.y
        });

        this.scene.events.emit('PAWN_DESTROY', this);
    }

}
