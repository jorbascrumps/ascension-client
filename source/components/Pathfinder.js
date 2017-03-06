export default class Pathfinder {
    constructor ({ game } = {}) {
        this.game = game;
        this.graph;
        this.blocked;

        this.setupGrid();
    }

    setupGrid () {
        const {
            game: {
                state
            }
        } = this;
        const {
            tilemap: {
                layers
            }
        } = state.getCurrentState();

        const mapLayer = layers
            .find(layer => layer.name === 'map');
        const blockedLayer = layers
            .find(layer => layer.name === 'blocked');

        const mapGrid = mapLayer.data
            .map((_, c) => mapLayer.data
                .map(r => Number(r[c].index > -1))
            );
        const blockedGrid = blockedLayer.data
            .map((_, c) => blockedLayer.data
                .map((r, i) => Number(r[c].index <= 0) && Number(mapGrid[c][i] === 1))
            );

        this.blocked = blockedGrid;
        this.graph = new Graph(blockedGrid, {
            diagonal: astar.DIAGONAL_MODE.ONE_OBSTACLE
        });
    }

    calculatePath = ({ start, end }) => {
        const startNode = this.graph.grid[Math.floor(start.x / 50)][Math.floor(start.y / 50)];
        const endNode = this.graph.grid[Math.floor(end.x / 50)][Math.floor(end.y / 50)];

        return astar.search(this.graph, startNode, endNode);
    }

    isBlockedTile = ({ x, y }) => {
        const row = Math.floor(x / 50);
        const col = Math.floor(y / 50);

        return !Boolean(this.blocked[row][col]);
    }

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
}
