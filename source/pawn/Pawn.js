import EventEmitter from 'eventemitter3';

import * as PHASES from '../../core/common/constants/phases';
import * as Util from '../components/Util';

import AttackState from '../behaviours/Attack';
import ActivationState from '../behaviours/Activation';
import IdleState from '../behaviours/Idle';
import MovementState from '../behaviours/Movement';
import RestorationState from '../behaviours/Restoration';
import SearchState from '../behaviours/Search';
import TagState from '../behaviours/Tag';

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
        this.on('changedata_currentHealth', (_, val, prev) => this.setHealth(val, prev));
        this.on('changedata_active', (_, val, prev) => this.setActive(val, prev));
        this.on('changedata_lightRadius', (_, val, prev) => this.setLightRadius(val, prev));

        this.damageNum = game.add.text(initialX + 25, initialY, '00')
            .setAlpha(0)
            .setAlign('center')
            .setColor('#ff0000')
            .setFontStyle('bold')
            .setOrigin(0.5, 1);

        // Setup sprite
        this.sprite = game.add.sprite(0, 0, asset);
        this.sprite.setOrigin(-0.25, 0.5);
        this.sprite.setScale(2);
        this.add(this.sprite);

        // Setup health
        this.data.set({
            showHealthBar: false
        });
        this.healthBar = game.add.graphics(0, 0)
            .setVisible(false);
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
        this.lightRadius = 5;
        this.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(0, 0, 50, 50),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        });

        // Setup navigation
        this.navPath = [];
        this.navGraphic = game.add.graphics(0, 0);
        this.pathfinder.closeNode({ x: this.x, y: this.y });

        // Setup events
        this.events = new EventEmitter();
        this.events.on('STATE_CHANGE', this.changeState, this);
        this.events.emit('STATE_CHANGE', IdleState);

        this.unsubscribe = this.client.store.subscribe(() =>
            this.sync(this.client.store.getState())
        );
        this.sync(this.client.store.getState());

        this.on('pointerover', () =>
            this.data.set({
                showHealthBar: true
            })
        );
        this.on('pointerout', () =>
            this.data.set({
                showHealthBar: false
            })
        );

        this.on('destroy', this.onDestroy);
    }

    changeState (state) {
        if (this.state) {
            this.state.onExit();
        }

        this.previousState = this.state;
        this.state = typeof state === 'function'
            ?   new state(this)
            :   new state.constructor(this);
    }

    sync = ({
        G: {
            pawns: {
                [this.id]: {
                    active,
                    currentHealth,
                    exhausted,
                    inventory,
                    lightRadius,
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
                active,
                exhausted,
                currentHealth,
                inventory,
                lightRadius,
                maxHealth
            });
        } catch (e) {}

        if (this.ownedByPlayer && (phase !== this.currentPhase || turnEnded)) {
            this.currentPhase = phase;
            this.setupPhaseHandlers(phase);
        }
    }

    setupPhaseHandlers = phase => {
        if (undefined === this.data) {
            return console.warn('Could not setup phase handlers'); // TODO: Find real cause
        }

        const {
            data: {
                values: {
                    active,
                    exhausted,
                } = {}
            } = {}
        } = this;

        switch (phase) {
            case PHASES.ATTACK:
                if (active) {
                    return this.events.emit('STATE_CHANGE', AttackState);
                }
            case PHASES.RESTORATION:
                if (!exhausted) {
                    return this.events.emit('STATE_CHANGE', RestorationState);
                }
            case PHASES.ACTIVATION:
                if (active) {
                    return this.events.emit('STATE_CHANGE', ActivationState);
                }
            case PHASES.MOVEMENT:
                if (active) {
                    return this.events.emit('STATE_CHANGE', MovementState);
                }
            case PHASES.SEARCH:
                if (active) {
                    return this.events.emit('STATE_CHANGE', SearchState);
                }
            case PHASES.TAG:
                if (active) {
                    return this.events.emit('STATE_CHANGE', TagState);
                }
            default:
                return this.events.emit('STATE_CHANGE', IdleState);
        }
    }

    preUpdate (...args) {
        this.update(...args);
    }

    update () {
        const {
            data: {
                values: {
                    showHealthBar
                }
            }
        } = this;

        if (!this.scene.registry.get('settings').disableFog) {
            const pawnTile = this.scene.mapManager.mapLayer.getTileAtWorldXY(this.x, this.y);
            this.setAlpha(pawnTile.properties.seen ? 1 : 0.1);
        }

        this.renderHealthBar(showHealthBar);

        this.isActive && this.pathfinder.renderPath(
            this.navPath,
            { x: this.x, y: this.y },
            this.speed
        );
    }

    renderHealthBar = (show) => {
        this.healthBar
            .setVisible(show)
            .clear();

        if (false === show) {
            return;
        }

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

    attack = () => this.client.moves.attackPawn(this.id)

    activate = () => this.client.moves.activate(this.id)

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
            this.client.moves.move(this.id, pos);
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

    setHealth = (val, prev) => {
        if (val === prev) {
            return;
        }

        if (val < prev) {
            this.damageNum.setText(`-${prev - val}`);
            this.scene.tweens.add({
                targets: this.damageNum,
                duration: 500,
                alpha: {
                    value: 1,
                    yoyo: 1,
                    duration: 250
                },
                y: '-=25',
                onStart: (tween, [ target ]) => {
                    target.setPosition(this.x + 25, this.y);
                },
                onComplete: (tween, [ target ]) => {
                    target.setY(this.y);
                }
            });
        }

        if (val <= 0) {
            return this.destroy();
        }
    }

    setActive = val => this.isActive = val

    setLightRadius = val => this.lightRadius = val

}
