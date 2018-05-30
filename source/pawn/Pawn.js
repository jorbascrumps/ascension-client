import * as Util from '../components/Util';

export default class extends Phaser.GameObjects.Container {
    constructor ({
        game,
        store,
        client,
        pathfinder,
        id,
        asset = 'player',
        position,
        owner,
        currentHealth = 10,
        maxHealth = 10,
        speed = 8
    } = {}) {
        super(game, position.x, position.y);

        game.sys.displayList.add(this);
        game.sys.updateList.add(this);

        const {
            user: {
                session
            }
        } = store.getState();

        this.id = id || Date.now().toString();

        this.setSize(50);

        // Setup sprite
        this.sprite = game.add.sprite(0, 0, asset);
        this.sprite.setOrigin(-0.25, 0.5);
        this.sprite.setScale(2);
        this.add(this.sprite);

        this.store = store;
        this.client = client;
        this.pathfinder = pathfinder;
        this.owner = owner;
        this.ownedByPlayer = owner === session;
        this.currentHealth = currentHealth;
        this.maxHealth = maxHealth;
        this.speed = speed;
        this.busy = false;
        this.currentTurn = false;

        this.navPath = [];
        this.navGraphic = game.add.graphics(0, 0);

        if (this.ownedByPlayer) {
            this.scene.input.on('pointermove', this.updateNavPath);
            this.scene.input.on('pointerdown', () => {
                if (this.navPath.length > this.speed) {
                    return;
                }

                const path = this.navPath.map(({x, y}) => ({
                    x: Util.navPathToWorldCoord(x),
                    y: Util.navPathToWorldCoord(y)
                }));

                this.moveToPath({
                    path,
                    sync: true
                });
            });
        }

        this.client.store.subscribe(() => this.sync(this.client.store.getState()));
    }

    sync = ({
        ctx: {
            currentPlayer,
            ...rest
        }
    } = {}) => {
        this.currentTurn = currentPlayer == this.id;
    }

    preUpdate (...args) {
        this.update(...args);
    }

    update () {
        this.pathfinder.renderPath(
            this.navGraphic,
            this.navPath,
            { x: this.x, y: this.y },
            this.speed
        );
    }

    updateNavPath = ({
        x = 0,
        y = 0
    } = {}) => {
        if (this.busy || !this.currentTurn) {
            return;
        }

        this.navPath = this.pathfinder.calculatePath({
            start: {
                x: Util.navPathToWorldCoord(Math.floor(this.x / 50)),
                y: Util.navPathToWorldCoord(Math.floor(this.y / 50))
            },
            end: {
                x,
                y
            }
        });
    }

    moveToPath = ({
        path = [],
        sync = false
    } = {}) => this.scene.tweens.timeline({
        targets: this,
        ease: 'Power4',
        onStart: () => {
            this.client.moves.movePawn(this.id);
            this.busy = true;
            this.navPath = [];
            this.onPreMove();
        },
        onComplete: () => {
            this.busy = false
            this.onPostMove();
        },
        tweens: path.map(p => ({
            ...p,
            duration: 500,
            onCompleteParams: [{
                sync
            }],
            onComplete: this.onMoveEnd,
            onStartParams: [{
                sync
            }],
            onStart: this.onMoveStart
        }))
    })

    onPreMove = () => this.pathfinder.openNodeAtCoord({
        x: Math.ceil(this.x),
        y: Math.ceil(this.y)
    })

    onMoveStart = ({ data }, [ target ], { sync = false } = {}) => {
        const movement = data.find(({ key }) => key === 'x');

        if (movement.getEndValue() === Math.ceil(this.x)) {
            return;
        }

        this.sprite.flipX = movement.getEndValue() <= Math.ceil(this.x);

        return this;
    }

    onPostMove = () => this.pathfinder.closeNodeAtCoord({
        x: Math.ceil(this.x),
        y: Math.ceil(this.y)
    })

    onMoveEnd = (tween, [ target ], { sync = false } = {}) => {
        if (sync) {
            this.store.dispatch({
                type: 'PAWN_MOVE',
                id: this.id,
                position: {
                    x: this.x,
                    y: this.y
                },
                sync: true
            });
        }

        return this;
    }

/*
    setupEvents = () => {
        if (!this.ownedByPlayer) {
            return;
        }

        this.inputEnabled = true;
        this.input.useHandCursor = true;
        this.input.priorityID = 1;

        this.events.onInputDown.add(this.onInputDown);
        this.events.onInputUp.add(this.onInputUp);
        this.events.onInputOver.add(this.onInputOver);
        this.events.onInputOut.add(this.onInputOut);
        this.events.onKilled.add(this.onDeath);

        this.game.input.onDown.add(this.calculatePath);
        this.game.input.onUp.add(this.clearPath);

        this.traceAdjacentTiles();
        this.toggleAdjacentThings();
    }
*/
/*
    onInputDown = (tile, pointer) => {
        this.attachToCursor = true;
        this.cache.position = {
            ...this.position
        };
    }
*/
/*
    onInputUp = () => {
        const {
            game: {
                state
            }
        } = this;
        const {
            Pathfinder: {
                canPathToTile
            }
        } = state.getCurrentState();
        const snapPosition = snapCoordToGrid({
            x: this.position.x,
            y: this.position.y
        });
        const targetPosition = new Phaser.Point(snapPosition.x, snapPosition.y);
        const canPath = canPathToTile({
            start: this.cache.position,
            end: snapPosition
        });
        const isAdajcentTile = this.tiles.collisions.children
            .find(({ position: { x, y } }) => x === targetPosition.x && y === targetPosition.y);

        if (isAdajcentTile && canPath) {
            this.moveTo({
                ...isAdajcentTile.position,
                sync: true
            });
        } else {
            this.moveTo(this.cache.position);
        }

        this.attachToCursor = false;
    }
*/
/*
    onInputOver = () => {}
*/
/*
    onInputOut = () => {}
*/
/*
    onDeath = () => {
        this.clearTrace();
    }
*/
/*
    clearTrace = () => {
        this.tracing = false;

        this.tiles.traces.removeChildren();
        this.tiles.collisions.removeChildren();
    }
*/
/*
    traceAdjacentTiles = () => {
        const {
            game: {
                state
            }
        } = this;
        const {
            Pathfinder: {
                canPathToTile
            }
        } = state.getCurrentState();

        this.clearAdjacentTiles();

        const positions = [
            { x : this.position.x - 50, y: this.position.y + 50 }, // bottom left
            { x : this.position.x - 50, y: this.position.y      }, // left
            { x : this.position.x - 50, y: this.position.y - 50 }, // top left
            { x : this.position.x,      y: this.position.y - 50 }, // top
            { x : this.position.x + 50, y: this.position.y - 50 }, // top right
            { x : this.position.x + 50, y: this.position.y      }, // right
            { x : this.position.x + 50, y: this.position.y + 50 }, // bottom right
            { x : this.position.x,      y: this.position.y + 50 }  // bottom
        ];

        positions
            .map(tile => ({
                ...tile,
                blocked: !canPathToTile({
                    start: this.position,
                    end: tile
                })
            }))
            .forEach(this.traceTileAtPosition);
    }
*/
/*
    traceTileAtPosition = ({
        x,
        y,
        enabled = false,
        blocked = false,
        group = null
    } = {}) => {
        const fillColour = blocked ? 0xff0000 : 0x00ff00;

        const sprite = this.tiles.collisions.create(x, y);
        sprite.valid = true;
        sprite.height = 50;
        sprite.width = 50;
        sprite.inputEnabled = true;
        this.game.physics.arcade.enable(sprite);
        this.tiles.collisions.add(sprite);

        if (!blocked) {
            sprite.input.useHandCursor = true;
            sprite.events.onInputDown.add(({
                position
            }) => this.moveTo({
                ...position,
                sync: true
            }));
            sprite.events.onInputOver.add(() => overlay.alpha = 1.5);
            sprite.events.onInputOut.add(() => overlay.alpha = 0.55);
        }

        const overlay = this.game.add.graphics();
        overlay.beginFill(fillColour, 0.5);
        overlay.lineStyle(2, fillColour, 1);
        overlay.drawRect(x + 2, y + 2, 46, 46);
        overlay.exists = enabled;
        overlay.alpha = 0.55;
        (group || this.tiles.traces).addChild(overlay);
    }
*/
/*
    toggleAdjacentThings = () => this.tiles.traces
        .forEach(thing => thing.exists = !thing.exists);
*/
/*
    clearAdjacentTiles = () => {
        this.tiles.collisions.removeChildren();
        this.tiles.traces.removeChildren();
    }
*/
/*
    update = () => {
        if (this.attachToCursor) {
            const offsetX = this.width / 2;
            const offsetY = this.height / 2;

            const {
                game: {
                    input: {
                        activePointer: {
                            position: {
                                x,
                                y
                            }
                        }
                    }
                }
            } = this;

            this.position.x = x - offsetX;
            this.position.y = y - offsetY;
        }
    }
*/
/*
    preMove = ({
        x,
        y
    }) => {
        if (this.ownedByPlayer) {
            this.clearAdjacentTiles();
        }

        const {
            game: {
                state
            }
        } = this;
        const {
            layers: {
                tagged
            }
        } = state.getCurrentState();
        const [
            tile
        ] = tagged.getTiles(this.cache.position.x, this.cache.position.y, 50, 50);

        if (tile.index > 0) {
            console.warn('Exiting [TAGGED] tile');
        }
    }
*/
/*
    postMove = ({
        x,
        y
    }) => {
        if (this.ownedByPlayer) {
            this.traceAdjacentTiles();
            this.toggleAdjacentThings();
        }

        const {
            game: {
                state
            }
        } = this;
        const {
            layers: {
                tagged
            },
            store: {
                dispatch
            }
        } = state.getCurrentState();
        const [
            tile
        ] = tagged.getTiles(x, y, 50, 50);

        if (tile.index > 0) {
            console.warn('Entering [TAGGED] tile');
        }
    }
*/
}

const snapCoordToGrid = ({
    x = 0,
    y = 0
} = {}) => {
    const xAdjust = x % 50;
    const yAdjust = y % 50;

    return {
        x: xAdjust <= 25
            ?   x - xAdjust
            :   x + (50 % xAdjust),
        y: yAdjust <= 25
            ?   y - yAdjust
            :   y + (50 % yAdjust)
    };
};
