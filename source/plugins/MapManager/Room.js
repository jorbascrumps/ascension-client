const TILES = {
    DOOR: 3,
};

export default class Room {

    constructor (config) {
        for (let key in config) {
            this[key] = config[key];
        }
    }

    getDoorLocations () {
        let doors = [];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.tiles[y][x].index == TILES.DOOR) {
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

}
