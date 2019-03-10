const TILES = {
    DOOR: 3,
};

export default class Room {

    #tagLayer

    #tilemap

    #tiles = []

    constructor (context, config) {
        this.#tilemap = context.make.tilemap({
            ...config,
            tileHeight: 50,
            tileWidth: 50,
            x: config.x * 50,
            y: config.y * 50,
        });
        const tileset = this.#tilemap.addTilesetImage('tiles');
        this.#tagLayer = this.#tilemap
            .createBlankDynamicLayer('tags', tileset, config.x * 50, config.y * 50);

        for (let key in config) {
            this[key] = config[key];
        }
    }

    getDoorLocations () {
        let doors = [];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.#tiles[y][x].index == TILES.DOOR) {
                    doors.push({ x: x, y: y });
                }
            }
        }

        return doors;
    }

    getTileAt (x, y) {
        if (!this.tiles[y]) {
            return null;
        }

        return this.tiles[y][x] || null;
    }

    sync ({
        tiles,
    }) {
        this.tiles = tiles;
    }

    get tiles () {
        return this.#tilemap;
    }

    set tiles (tiles) {
        this.#tiles = tiles;

        for (const [ rowIndex, rowData ] of tiles.entries()) {
            for (const [ colIndex, { tags = [] } ] of rowData.entries()) {
                if (tags.length === 0) {
                    this.#tagLayer.removeTileAt(colIndex, rowIndex);

                    continue;
                }

                this.#tagLayer.putTileAt(15, colIndex, rowIndex);
            }
        }
    }

}
