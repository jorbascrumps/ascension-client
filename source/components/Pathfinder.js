import * as Util from './Util';

export default {
    graph: undefined,
    scene: undefined,

    init ({
        tilesPerRow = 10,
        map,
        blocked
    } = {}) {
        this.graph = setupGrid({
            tilesPerRow,
            map,
            blocked
        });

        return this;
    },

    create () {
        return Object.create(this);
    },

    calculatePath ({
        start = {},
        end = {}
    }) {
        const startNode = this.getGridElementAt(start);
        const endNode = this.getGridElementAt(end);

        return astar.search(this.graph, startNode, endNode, {
            closest: true
        });
    },

    renderPath (graphic, path, { x = 0, y = 0 } = {}) {
        graphic.clear();

        const navPoints = [
            new Phaser.Math.Vector2(x + 25, y + 25),
            ...path
                .map(({ x, y }) => new Phaser.Math.Vector2(
                    Util.navPathToWorldCoord(x) + 25,
                    Util.navPathToWorldCoord(y) + 25
                ))
        ];

        const lineColor = path.length > 4 ? 0xff0000 : 0x00ff00;
        graphic.lineStyle(4, lineColor, .5);

        const curve = new Phaser.Curves.Spline(navPoints);
        curve.draw(graphic, 64);
    },

    getGridElementAt ({
        x = 0,
        y = 0
    } = {}) {
        return this.graph.grid[Math.floor(x / 50)][Math.floor(y / 50)];
    }
}

function setupGrid ({
    tilesPerRow,
    map,
    blocked
} = {}) {
    const mapData = translateMapData(
        blocked.map((_, r) =>
            _.map((_, c) =>
                Number(blocked[r][c].index < 0 && map[r][c].index > 0)
            )
        )
    );

    return new Graph(mapData, {
        diagonal: astar.DIAGONAL_MODE.NO_OBSTACLES
    });
}

const translateMapData = data => data
    .map((_, i, rows) =>
        rows
            .reduce((cache, row) => ([
                ...cache,
                row[i]
            ]), [])
    );
