export default class Pathfinder {
    constructor ({
        tilesPerRow = 10,
        map,
        blocked
    } = {}) {
        this.graph = setupGrid({
            tilesPerRow,
            map,
            blocked
        });
    }

    calculatePath = ({
        start = {},
        end = {}
    } = {}) => {
        const startNode = this.getGridElementAt(start);
        const endNode = this.getGridElementAt(end);

        return astar.search(this.graph, startNode, endNode, {
            closest: true
        });
    }

    getGridElementAt = ({
        x = 0,
        y = 0
    } = {}) => this.graph.grid[Math.floor(x / 50)][Math.floor(y / 50)]

/*
    isBlockedTile = ({ x, y }) => {
        const row = Math.floor(x / 50);
        const col = Math.floor(y / 50);

        if (typeof this.blocked[row] === 'undefined') {
            return true;
        }

        return !Boolean(this.blocked[row][col]);
    }
 */
/*
    canPathToTile = ({ start, end }) => {
        const isBlocked = this.isBlockedTile(end);

        if (isBlocked) {
            return false;
        }

        const pathToTile = this.calculatePath({
            start,
            end
        });

        return pathToTile.length === 1;
    }
 */
}

function setupGrid ({
    tilesPerRow,
    map,
    blocked
} = {}) {
    const translate = translateLayerData(tilesPerRow);
    const translatedMap = translate(map);
    const transBlocked = translate(blocked);
    const graphData = transBlocked
        .map((_, c) => transBlocked
            .map((r, i) => Number(r[c] === 0 && translatedMap[c][i] === 1))
        );

    return new Graph(translatedMap, {
        diagonal: astar.DIAGONAL_MODE.NO_OBSTACLES
    });
}

const translateLayerData = tilesPerRow => data =>
    data.reduce((cache, current, i) => {
        const rowNum = i % tilesPerRow;
        const row = cache[rowNum] || [];

        cache[rowNum] = [
            ...row,
            Number(current > 0)
        ];
        return cache;
    }, []);
