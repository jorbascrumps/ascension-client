const TILES = {
    DOOR: 6,
    FLOOR: [
        { index: 6, weight: 20 },
        { index: 7, weight: 1 },
        { index: 8, weight: 1 },
        { index: 26, weight: 1 },
    ],
    WALL: {
        BOTTOM_LEFT: 22,
        BOTTOM_RIGHT: 23,
        TOP_LEFT: 3,
        TOP_RIGHT: 4,
        BOTTOM: [
            { index: 1, weight: 4 },
            { index: 78, weight: 1 },
            { index: 79, weight: 1 },
            { index: 80, weight: 1 }
        ],
        LEFT: [
            { index: 21, weight: 4 },
            { index: 76, weight: 1 },
            { index: 95, weight: 1 },
            { index: 114, weight: 1 }
        ],
        RIGHT: [
            { index: 19, weight: 4 },
            { index: 77, weight: 1 },
            { index: 96, weight: 1 },
            { index: 115, weight: 1 }
        ],
        TOP: [
            { index: 39, weight: 4 },
            { index: 57, weight: 1 },
            { index: 58, weight: 1 },
            { index: 59, weight: 1 }
        ]
    }
};

export default class extends Phaser.Plugins.BasePlugin {

    init (height = 20, width = 20, tilesize = 50) {
        const scene = this.game.scene.getScene('LEVEL');

        if (null === scene) {
            return this;
        }

        this.raw = new Dungeon({
            randomSeed: 1234,
            doorPadding: 2,
            height,
            rooms: {
                height: {
                    max: 11,
                    min: 5,
                    onlyOdd: true
                },
                width: {
                    max: 11,
                    min: 5,
                    onlyOdd: true
                }
            },
            width
        });
        this.raw.drawToConsole({});

        this.map = scene.make.tilemap({
            height,
            tileHeight: tilesize,
            tileWidth: tilesize,
            width
        });
        const tileset = this.map.addTilesetImage('tiles');

        this.mapLayer = this.map
            .createBlankDynamicLayer('map', tileset);
        this.blockedLayer = this.map
            .createBlankDynamicLayer('blocked', tileset);
        this.interactionsLayer = this.map
            .createBlankDynamicLayer('interactions', tileset);

        this.raw.rooms
            .forEach(this.spawnRoom, this);

        return this;
    }

    spawnCorner (x = 0, y = 0, type = TILES.WALL.TOP_RIGHT) {
        this.blockedLayer.putTileAt(type, x, y);
    }

    spawnDoor (x = 0, y = 0) {
        const topNeighbour = this.blockedLayer.getTileAt(x, y - 1);
        const rightNeighbour = this.blockedLayer.getTileAt(x + 1, y);
        const bottomNeighbour = this.blockedLayer.getTileAt(x, y + 1);
        const leftNeighbour = this.blockedLayer.getTileAt(x - 1, y);

        if (topNeighbour !== null && bottomNeighbour !== null) {
            const rightWallTiles = TILES.WALL.RIGHT.map(({ index }) => index);

            if (rightWallTiles.includes(topNeighbour.index)) {
                this.blockedLayer.putTileAt(38, x, y - 1);
                this.blockedLayer.putTileAt(0, x, y + 1);
            } else {
                this.blockedLayer.putTileAt(40, x, y - 1);
                this.blockedLayer.putTileAt(2, x, y + 1);
            }
        } else if (rightNeighbour !== null && leftNeighbour !== null) {
            const topWallTiles = TILES.WALL.TOP.map(({ index }) => index);

            if (topWallTiles.includes(rightNeighbour.index)) {
                this.blockedLayer.putTileAt(40, x - 1, y);
                this.blockedLayer.putTileAt(38, x + 1, y);
            } else {
                this.blockedLayer.putTileAt(2, x - 1, y);
                this.blockedLayer.putTileAt(0, x + 1, y);
            }
        }

        this.blockedLayer.removeTileAt(x, y);
        this.mapLayer.putTileAt(TILES.DOOR, x, y);
        this.interactionsLayer.putTileAt(TILES.DOOR, x, y);
    }

    spawnEntrance (x, y) {
        this.mapLayer.putTileAt(167, x, y);
    }

    spawnExit (x, y) {
        this.mapLayer.putTileAt(100, x, y);
    }

    spawnRoom (room, index, rooms) {
        const {
            centerX,
            centerY,
            height,
            width,
            x,
            y
        } = room;
        const top = y;
        const right = x + (width - 1);
        const bottom = y + (height - 1);
        const left = x;

        this.mapLayer.weightedRandomize(x + 1, y + 1, width - 2, height - 2, TILES.FLOOR);

        // Corners
        this.spawnCorner(right, top, TILES.WALL.TOP_RIGHT);
        this.spawnCorner(right, bottom, TILES.WALL.BOTTOM_RIGHT);
        this.spawnCorner(left, bottom, TILES.WALL.BOTTOM_LEFT);
        this.spawnCorner(left, top, TILES.WALL.TOP_LEFT);

        // Walls
        this.spawnWall(left + 1, top, width - 2, 1, TILES.WALL.TOP);
        this.spawnWall(right, top + 1, 1, height - 2, TILES.WALL.RIGHT);
        this.spawnWall(left + 1, bottom, width - 2, 1, TILES.WALL.BOTTOM);
        this.spawnWall(left, top + 1, 1, height - 2, TILES.WALL.LEFT);

        // Doors
        room.getDoorLocations()
            .forEach(({ x: doorX, y: doorY }) =>
                this.spawnDoor(x + doorX, y + doorY)
            );
        
        if (index === 0) {
            this.spawnEntrance(centerX, centerY);
        }

        if (index === rooms.length - 1) {
            this.spawnExit(centerX, centerY);
        }
    }

    spawnWall (x = 0, y = 0, width = 1, height = 1, type = TILES.WALL.TOP) {
        this.blockedLayer.weightedRandomize(x, y, width, height, type);
    }
    
}
