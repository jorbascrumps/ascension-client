import Event from '../components/Event';
import {
    UPDATE_PAWN_POSITION
} from '../components/EventTypes';

export default class extends Phaser.Sprite {
    constructor ({
        game,
        id,
        asset = 'player_pawn',
        position,
        sync = true
    } = {}) {
        super(game, position.x, position.y, asset);

        const {
            game: {
                state
            }
        } = this;
        const {
            store
        } = state.getCurrentState();

        this.id = id || Date.now().toString();

        // Physics settings
        this.game.physics.arcade.enable(this);
        this.body.setSize(50, 50, 0, 0);
        this.body.moves = false;

        this.attachToCursor = false;
        this.tracing = false;
        this.cache = {
            position: null
        };
        this.tiles = {
            traces: this.game.add.group(),
            collisions: this.game.add.group(),
            path: [],
            drawPath: this.game.add.group()
        };
        this.game.world.moveDown(this.tiles.traces);

        this.setupEvents();
        this.traceAdjacentTiles();

        store.subscribe(() => {
            const {
                pawns: {
                    [this.id]: pawn
                } = {}
            } = store.getState();
        });

        if (sync) {
            store.dispatch({
                type: 'PAWN_REGISTER',
                id: this.id,
                position: {
                    x: this.position.x,
                    y: this.position.y
                },
                sync
            });
        }
    }

    setupEvents = () => {
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

        Event.on(UPDATE_PAWN_POSITION, this.moveTo);
    }

    onInputDown = (tile, pointer) => {
        this.toggleAdjacentThings();

        this.attachToCursor = true;
        this.cache.position = {
            ...this.position
        };
    }

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
            this.position = isAdajcentTile.position;
        } else {
            this.position = this.cache.position;
        }

        this.attachToCursor = false;
        this.toggleAdjacentThings();
        this.traceAdjacentTiles();
    }

    onInputOver = () => {}

    onInputOut = () => {}

    onDeath = () => {
        this.clearTrace();
    }

    clearTrace = () => {
        this.tracing = false;

        this.tiles.traces.removeChildren();
        this.tiles.collisions.removeChildren();
    }

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

        const overlay = this.game.add.graphics();
        overlay.beginFill(fillColour, 0.25);
        overlay.lineStyle(2, fillColour, 1);
        overlay.drawRect(x + 2, y + 2, 46, 46);
        overlay.exists = enabled;
        overlay.autoCull = true;
        (group || this.tiles.traces).addChild(overlay);
    }

    toggleAdjacentThings = () => this.tiles.traces
        .forEach(thing => thing.exists = !thing.exists);

    clearAdjacentTiles = () => {
        this.tiles.collisions.removeChildren();
        this.tiles.traces.removeChildren();
    }

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

    moveTo = ({ x, y }) => {
        const newPos = {
            x: x - (x % 50),
            y: y - (y % 50)
        };
        const distance = Math.floor(new Phaser.Line(
            this.position.x,
            this.position.y,
            newPos.x,
            newPos.y
        ).length);
        const duration = (distance - (distance % 50)) * 10;

        this.game.add.tween(this)
            .to(newPos, duration, Phaser.Easing.Linear.None)
            .start()
            .onComplete.add((pawn, tween) => {
                this.traceAdjacentTiles();
            });
    }

    tracePath = () => this.tiles.path
        .forEach(({ x, y}) => this.traceTileAtPosition({
            x: x * 50,
            y: y * 50,
            enabled: true,
            group: this.tiles.drawPath
        }))

    clearPath = () => this.tiles.drawPath.removeChildren()

    calculatePath = () => {
        const {
            game: {
                input: {
                    activePointer: mouse
                },
                state
            },
            position
        } = this;
        const {
            Pathfinder
        } = state.getCurrentState();

        this.tiles.path = Pathfinder.calculatePath({
            start: position,
            end: mouse
        });

        this.tracePath();
    }
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
