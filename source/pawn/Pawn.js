export default class extends Phaser.Sprite {
    constructor ({ group, asset, position } = {}) {
        super(group.game, position.x, position.y, asset);
        group.add(this);

        this.tracing = false;
        this.tiles = {
            traces: this.game.add.group(),
            collisions: this.game.add.group()
        };

        this.setupEvents();
        this.spawnAdjacentThings();
    }

    setupEvents = () => {
        this.inputEnabled = true;
        this.input.useHandCursor = true;

        this.events.onInputDown.add(this.onInputDown);
        this.events.onInputUp.add(this.onInputUp);
        this.events.onInputOver.add(this.onInputOver);
        this.events.onInputOut.add(this.onInputOut);
        this.events.onKilled.add(this.onDeath);
    }

    onInputDown = (tile, pointer) => {
        this.toggleAdjacentThings();
        // this.traceAdjacentTiles();

        // const {
        //     position: {
        //         x: pointerX,
        //         y: pointerY
        //     }
        // } = pointer;
        // const {
        //     game: {
        //         camera: {
        //             x: cameraX,
        //             y: cameraY
        //         }
        //     }
        // } = this;
        // const newPosition = {
        //     x: pointerX + cameraX,
        //     y: pointerY + cameraY
        // };
        //
        // this.game.add.tween(this)
        //     .to(newPosition, 0, Phaser.Easing.Linear.Noce)
        //     .start()
    }

    onInputUp = () => {
        this.toggleAdjacentThings();
    }

    onInputOver = () => {}

    onInputOut = () => {}

    onDeath = () => {
        this.clearTrace();
    }

    traceAdjacentTiles = () => {
        this.tracing = true;

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

        positions.forEach(this.traceAtPosition);
    }

    clearTrace = () => {
        this.tracing = false;

        this.tiles.traces.removeChildren();
        this.tiles.collisions.removeChildren();
    }

    traceAtPosition = ({ x, y } = {}) => {
        const sprite = this.tiles.collisions.create(x, y);
        sprite.valid = true;
        sprite.height = 50;
        sprite.width = 50;
        sprite.inputEnabled = true;
        this.tiles.collisions.add(sprite);

        const overlay = this.game.add.graphics();
        overlay.beginFill(0x00ff00, 0.5);
        overlay.lineStyle(1, 0x00ff00, 1);
        overlay.drawRect(x + 1, y + 1, 48, 48);
        this.tiles.traces.addChild(overlay);
    }

    spawnAdjacentThings = () => {
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

        positions.forEach(this.spawnAdjacentThing);
    }

    spawnAdjacentThing = ({ x, y, enabled = false } = {}) => {
        const sprite = this.tiles.collisions.create(x, y);
        sprite.valid = true;
        sprite.height = 50;
        sprite.width = 50;
        sprite.inputEnabled = true;
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
}
