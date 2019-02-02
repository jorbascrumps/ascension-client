import Room from './Room';

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
    },
    CHEST: 166,
};

export default class Map {

    constructor ({
        context,
        height = 20,
        rooms = [],
        tilesize = 50,
        width = 20,
    } = {}) {
        this.rooms = rooms.map(room => new Room(room));

        this.map = context.make.tilemap({
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

        this.rooms
            .forEach(this.spawnRoom, this);

        // context.events.on('MAP_ROOM_REVEAL', this.revealRoom, this);

        return this;
    }

    get blocked () {
        return getLayerIndices(this.blockedLayer);
    }

    get walkable () {
        return getLayerIndices(this.mapLayer);
    }

    revealRoom (x, y) {
        const {
            index: tileIndex,
            x: tileX,
            y: tileY
        } = this.interactionsLayer.getTileAtWorldXY(x, y, true);

        if (tileIndex !== TILES.DOOR) {
            return;
        }

        const hiddenRoom = [
            [ tileX, tileY - 1 ],
            [ tileX + 1, tileY ],
            [ tileX, tileY + 1 ],
            [ tileX - 1, tileY ],
        ]
            .map(([ x, y ]) => this.mapLayer.getTileAt(x, y, true))
            .find(({ alpha }) => alpha === 0);

        if (typeof hiddenRoom === 'undefined') {
            return;
        }

        const room = this.raw.getRoomAt(hiddenRoom.x, hiddenRoom.y);
        this.setRoomAlpha(room, 1);
    }

    setRoomAlpha ({ height = 1, width = 1, x = 0, y = 0 }, alpha = 1) {
        this.blockedLayer.forEachTile(tile => tile.alpha = alpha, undefined, x, y, width, height);
        this.interactionsLayer.forEachTile(tile => tile.alpha = alpha, undefined, x, y, width, height);
        this.mapLayer.forEachTile(tile => tile.alpha = alpha, undefined, x, y, width, height);
    }

    spawnCorner (x = 0, y = 0, type = TILES.WALL.TOP_RIGHT, room) {
        this.blockedLayer.putTileAt(type, x, y);
        const tile = this.blockedLayer.getTileAt(x, y);
        tile.properties = room.getTileAt(tile.x - x, tile.y - y) || {};
    }

    spawnDoor (x = 0, y = 0, room) {
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


        const tile = this.mapLayer.getTileAt(x, y);
        tile.properties = room.getTileAt(tile.x - x, tile.y - y) || {};
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
        this.mapLayer
            .getTilesWithin(x + 1, y + 1, width - 2, height - 2)
            .forEach(tile => tile.properties = room.getTileAt(tile.x - x, tile.y - y) || {});

        // Corners
        this.spawnCorner(right, top, TILES.WALL.TOP_RIGHT, room);
        this.spawnCorner(right, bottom, TILES.WALL.BOTTOM_RIGHT, room);
        this.spawnCorner(left, bottom, TILES.WALL.BOTTOM_LEFT, room);
        this.spawnCorner(left, top, TILES.WALL.TOP_LEFT, room);

        // Walls
        this.spawnWall(left + 1, top, width - 2, 1, TILES.WALL.TOP, room);
        this.spawnWall(right, top + 1, 1, height - 2, TILES.WALL.RIGHT, room);
        this.spawnWall(left + 1, bottom, width - 2, 1, TILES.WALL.BOTTOM, room);
        this.spawnWall(left, top + 1, 1, height - 2, TILES.WALL.LEFT, room);

        // Doors
        room.getDoorLocations()
            .forEach(({ x: doorX, y: doorY }) =>
                this.spawnDoor(x + doorX, y + doorY, room)
            );

        if (index === 0) {
            this.spawnEntrance(centerX, centerY);
        } else {
            this.setRoomAlpha(room, 1);
        }

        if (index === rooms.length - 1) {
            this.spawnExit(centerX, centerY);
        }

        // Chests
        if (index !== rooms.length - 1 && index !== 0) {
            const shouldSpawnChest = Phaser.Math.RND.weightedPick([ 0, 0, 0, 0, 0, 1 ]);

            if (shouldSpawnChest) {

                // Avoid blocking doorways by restricting spawn area
                const spawn = new Phaser.Geom.Rectangle(0, 0, width - 4, height - 4)
                    .getRandomPoint();
                this.spawnChest(x + 2 + Math.floor(spawn.x), y + 2 + Math.floor(spawn.y));
            }
        }
    }

    spawnWall (x = 0, y = 0, width = 1, height = 1, type = TILES.WALL.TOP, room) {
        this.blockedLayer.weightedRandomize(x, y, width, height, type);
        this.blockedLayer
            .getTilesWithin(x, y, width, height)
            .forEach(tile => tile.properties = room.getTileAt(tile.x - x, tile.y - y) || {});
    }

    spawnChest (x = 0, y = 0) {
        this.interactionsLayer.putTileAt(TILES.CHEST, x, y);
    }

}

const getLayerIndices = ({ layer: { data }}) => data
    .map(row => row
        .reduce((cache, { alpha, index }) => ([
            ...cache,
            alpha === 1 ? index : -1
        ]), [])
    );
