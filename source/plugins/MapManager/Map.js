import isEqual from 'lodash/fp/isEqual'

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

    #layers = {
        blocked: null,
        interactions: null,
        map: null,
    }

    constructor ({
        context,
        height = 20,
        rooms = [],
        tilesize = 50,
        width = 20,
    } = {}) {
        this.map = context.make.tilemap({
            height,
            tileHeight: tilesize,
            tileWidth: tilesize,
            width
        });
        const tileset = this.map.addTilesetImage('tiles');

        this.#layers.map = this.map
            .createBlankDynamicLayer('map', tileset);
        this.#layers.blocked = this.map
            .createBlankDynamicLayer('blocked', tileset);
        this.#layers.interactions = this.map
            .createBlankDynamicLayer('interactions', tileset);

        this.rooms = rooms.map(room =>
            new Room(context, room)
        );

        this.rooms
            .forEach(this.spawnRoom, this);

        // context.events.on('MAP_ROOM_REVEAL', this.revealRoom, this);

        return this;
    }

    onLevelDataChange (_, { rooms: newRooms }, { rooms: oldRooms }) {
        newRooms
            .filter((nR, i) =>
                nR.tiles.some((row, j) =>
                    row.some((tile, k) =>
                        !isEqual(tile, oldRooms[i].tiles[j][k])
                    )
                )
            )
            .map(room => newRooms.indexOf(room))
            .map(index => this.rooms[index] = new Room(newRooms[index]))
            .forEach(this.setRoomTileProps);
    }

    get blocked () {
        return getLayerIndices(this.#layers.blocked);
    }

    get walkable () {
        return getLayerIndices(this.#layers.map);
    }

    get blockedLayer () {
        return this.#layers.blocked;
    }

    get interactionsLayer () {
        return this.#layers.interactions;
    }

    get mapLayer () {
        return this.#layers.map;
    }

    revealRoom (x, y) {
        const {
            index: tileIndex,
            x: tileX,
            y: tileY
        } = this.#layers.interactions.getTileAtWorldXY(x, y, true);

        if (tileIndex !== TILES.DOOR) {
            return;
        }

        const hiddenRoom = [
            [ tileX, tileY - 1 ],
            [ tileX + 1, tileY ],
            [ tileX, tileY + 1 ],
            [ tileX - 1, tileY ],
        ]
            .map(([ x, y ]) => this.#layers.map.getTileAt(x, y, true))
            .find(({ alpha }) => alpha === 0);

        if (typeof hiddenRoom === 'undefined') {
            return;
        }

        const room = this.raw.getRoomAt(hiddenRoom.x, hiddenRoom.y);
        this.setRoomAlpha(room, 1);
    }

    setRoomAlpha ({ height = 1, width = 1, x = 0, y = 0 }, alpha = 1) {
        this.#layers.blocked.forEachTile(tile => tile.alpha = alpha, undefined, x, y, width, height);
        this.#layers.interactions.forEachTile(tile => tile.alpha = alpha, undefined, x, y, width, height);
        this.#layers.map.forEachTile(tile => tile.alpha = alpha, undefined, x, y, width, height);
    }

    spawnCorner (x = 0, y = 0, type = TILES.WALL.TOP_RIGHT, room) {
        this.#layers.blocked.putTileAt(type, x, y);
        const tile = this.#layers.blocked.getTileAt(x, y);
        tile.properties = room.getTileAt(tile.x - x, tile.y - y) || {};
    }

    spawnDoor (x = 0, y = 0, room) {
        const topNeighbour = this.#layers.blocked.getTileAt(x, y - 1);
        const rightNeighbour = this.#layers.blocked.getTileAt(x + 1, y);
        const bottomNeighbour = this.#layers.blocked.getTileAt(x, y + 1);
        const leftNeighbour = this.#layers.blocked.getTileAt(x - 1, y);

        if (topNeighbour !== null && bottomNeighbour !== null) {
            const rightWallTiles = TILES.WALL.RIGHT.map(({ index }) => index);

            if (rightWallTiles.includes(topNeighbour.index)) {
                this.#layers.blocked.putTileAt(38, x, y - 1);
                this.#layers.blocked.putTileAt(0, x, y + 1);
            } else {
                this.#layers.blocked.putTileAt(40, x, y - 1);
                this.#layers.blocked.putTileAt(2, x, y + 1);
            }
        } else if (rightNeighbour !== null && leftNeighbour !== null) {
            const topWallTiles = TILES.WALL.TOP.map(({ index }) => index);

            if (topWallTiles.includes(rightNeighbour.index)) {
                this.#layers.blocked.putTileAt(40, x - 1, y);
                this.#layers.blocked.putTileAt(38, x + 1, y);
            } else {
                this.#layers.blocked.putTileAt(2, x - 1, y);
                this.#layers.blocked.putTileAt(0, x + 1, y);
            }
        }

        this.#layers.blocked.removeTileAt(x, y);
        this.#layers.map.putTileAt(TILES.DOOR, x, y);
        this.#layers.interactions.putTileAt(TILES.DOOR, x, y);


        const tile = this.#layers.map.getTileAt(x, y);
        tile.properties = room.getTileAt(tile.x - x, tile.y - y) || {};
    }

    spawnEntrance (x, y) {
        this.#layers.map.putTileAt(167, x, y);
    }

    spawnExit (x, y) {
        this.#layers.map.putTileAt(100, x, y);
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

        this.#layers.map.weightedRandomize(x + 1, y + 1, width - 2, height - 2, TILES.FLOOR);
        this.setRoomTileProps(room);

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
        this.#layers.blocked.weightedRandomize(x, y, width, height, type);
        this.#layers.blocked
            .getTilesWithin(x, y, width, height)
            .forEach(tile => tile.properties = room.getTileAt(tile.x - x, tile.y - y) || {});
    }

    spawnChest (x = 0, y = 0) {
        this.#layers.interactions.putTileAt(TILES.CHEST, x, y);
    }

    getRoomTiles = (room) =>
        this.#layers.map
            .getTilesWithin(room.x, room.y, room.width, room.height)

    setRoomTileProps = room =>
        this.getRoomTiles(room)
            .forEach(tile =>
                tile.properties = room.getTileAt(tile.x - room.x, tile.y - room.y) || {}
            )

    sync = ({
        G: {
            map: {
                rooms,
            },
        }
    }) => {
        this.rooms.map((room, i) =>
            room.sync(rooms[i])
        );
    }

}

const getLayerIndices = ({ layer: { data }}) => data
    .map(row => row
        .reduce((cache, { alpha, index }) => ([
            ...cache,
            alpha === 1 ? index : -1
        ]), [])
    );
