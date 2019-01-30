import {
    Mrpas,
} from 'mrpas';

export default class FOVLayer {

    #sightRadius = 8

    #lightDropoff = [ 0.8, 0.6, 0.4, 0.2, 0 ]

    #seenTileAlpha = 0.75

    #fogOpacity = 0.90

    #layerDepth = 99

    constructor (scene, map, walls, texture) {
        const tilemapTexture = map.tilemap.addTilesetImage(texture);

        this.layer = map.tilemap
            .createBlankDynamicLayer('fov', tilemapTexture, 0, 0)
            .setAlpha(this.#fogOpacity)
            .fill(0x000000)
            .setDepth(this.#layerDepth);
        this.mrpas = new Mrpas(map.tilemap.width, map.tilemap.height, (x, y) => {
            return walls.getTileAt(x, y, true).index < 0
        });

        this.lastPos = new Phaser.Math.Vector2({ x: -1, y: -1 });
        this.map = map;
        this.walls = walls;
    }

    update (position, bounds, delta) {
        if (!this.lastPos.equals(position)) {
            this.updateMRPAS(position);
            this.lastPos = position.clone();
        }

        for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
            for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
                if (y < 0 || y >= this.map.height || x < 0 || x >= this.map.width) {
                    continue;
                }

                const tile = this.layer.getTileAt(x, y);

                if (!tile) {
                    continue;
                }

                const {
                    desiredAlpha: desiredFloorAlpha = 1
                } = this.map.getTileAt(x, y, true);

                this.updateTileAlpha(tile, desiredFloorAlpha, delta);

                const {
                    desiredAlpha: desiredWallAlpha = 1
                } = this.walls.getTileAt(x, y, true);

                this.updateTileAlpha(tile, desiredWallAlpha, delta);
            }
        }
    }

    updateMRPAS (position) {
        this.map
            .filterTiles(this.filterSeenTiles)
            .forEach(this.setSeenTileAlpha);

        this.walls
            .filterTiles(this.filterSeenTiles)
            .forEach(this.setSeenTileAlpha);

        this.mrpas.compute(
            position.x,
            position.y,
            this.#sightRadius,
            (x, y) => this.map.getTileAt(x, y, true).seen,
            (x, y) => {
                const distance = Math.floor(
                    new Phaser.Math.Vector2(x, y)
                        .distance(
                            new Phaser.Math.Vector2(position.x, position.y)
                        )
                );

                let rolloff = 0;
                if (distance <= this.#sightRadius) {
                    rolloff = this.#sightRadius - distance;
                }

                let alpha = 0;
                if (rolloff < this.#lightDropoff.length) {
                    alpha = this.#lightDropoff[rolloff];
                }

                let tile = this.map.getTileAt(x, y);
                if (tile) {
                    tile.desiredAlpha = alpha;
                    tile.seen = true;
                }

                let wall = this.walls.getTileAt(x, y);
                if (wall) {
                    wall.desiredAlpha = alpha;
                    wall.seen = true;
                }
            }
        )
    }

    updateTileAlpha (tile, desiredAlpha, delta) {
        const distance = Math.max(Math.abs(tile.alpha - desiredAlpha), 0.05);
        const updateFactor = 0.004 * delta * distance;

        if (tile.alpha > desiredAlpha) {
            tile.setAlpha(Phaser.Math.MinSub(tile.alpha, updateFactor, desiredAlpha));
        } else if (tile.alpha < desiredAlpha) {
            tile.setAlpha(Phaser.Math.MaxAdd(tile.alpha, updateFactor, desiredAlpha));
        }
    }

    filterSeenTiles = ({ seen }) => seen

    setSeenTileAlpha = tile => tile.desiredAlpha = this.#seenTileAlpha

}
