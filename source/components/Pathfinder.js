export default class Pathfinder {
    constructor ({ game } = {}) {
        this.game = game;

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

        const mapData = layers.find(layer => layer.name === 'map');
        const blockedData = layers.find(layer => layer.name === 'blocked');

        const mapGrid = mapData.data
            .map((_, c) => mapData.data
                .map(r => Number(r[c].index > -1))
            );
        const blockedGrid = blockedData.data
            .map((_, c) => blockedData.data
                .map((r, i) => Number(r[c].index <= 0) && Number(mapGrid[c][i] === 1))
            );

        this.graph = new Graph(blockedGrid, {
            diagonal: true
        });
    }

    calculatePath = ({ start, end }) => {
        const startNode = this.graph.grid[Math.floor(start.x / 50)][Math.floor(start.y / 50)];
        const endNode = this.graph.grid[Math.floor(end.x / 50)][Math.floor(end.y / 50)];

        return astar.search(this.graph, startNode, endNode, {
            closest: true
        });
    }
}
