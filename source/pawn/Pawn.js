import Event from '../components/Event';
import {
    UPDATE_PAWN_POSITION
} from '../components/EventTypes';

export default class extends Phaser.Sprite {
    constructor ({ group, asset, position } = {}) {
        super(group.game, position.x, position.y, asset);
        group.add(this);

        // Physics settings
        this.game.physics.arcade.enable(this);
        this.body.setSize(50, 50, 0, 0);
        this.body.moves = false;

        this.tracing = false;
        this.tiles = {
            traces: this.game.add.group(),
            collisions: this.game.add.group()
        };

        this.setupEvents();
        this.traceAdjacentTiles();
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

        Event.on(UPDATE_PAWN_POSITION, this.moveTo);
    }

    onInputDown = (tile, pointer) => {
        this.toggleAdjacentThings();
    }

    onInputUp = () => {
        this.toggleAdjacentThings();
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

        positions.forEach(this.traceTileAtPosition);
    }

    traceTileAtPosition = ({ x, y, enabled = false } = {}) => {
        const sprite = this.tiles.collisions.create(x, y);
        sprite.valid = true;
        sprite.height = 50;
        sprite.width = 50;
        sprite.inputEnabled = true;
        this.game.physics.arcade.enable(sprite);
        this.tiles.collisions.add(sprite);

        const overlay = this.game.add.graphics();
        overlay.beginFill(0x00ff00, 0.5);
        overlay.lineStyle(1, 0x00ff00, 1);
        overlay.drawRect(x + 1, y + 1, 48, 48);
        overlay.exists = false;
        overlay.autoCull = true;
        this.tiles.traces.addChild(overlay);
    }

    toggleAdjacentThings = () =>  {
        this.tiles.traces.forEach(thing => thing.exists = !thing.exists);
    }

    clearAdjacentTiles = () => {
        this.tiles.collisions.removeChildren();
        this.tiles.traces.removeChildren();
    }

    update = () => {}

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
}
