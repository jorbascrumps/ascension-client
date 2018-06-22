import * as Util from '../components/Util';

export default class extends Phaser.Plugins.BasePlugin {

    start (map, blocked, tilesPerRow = 10) {
        this.graph = setupGrid({
            tilesPerRow,
            map,
            blocked
        });
        this.pathTrail = this.pluginManager.add.graphics(0, 0);
        this.pathDestination = this.pluginManager.add.graphics(0, 0);
        this.pathCache = [];

        this.pluginManager.tweens.add({
            targets: [ this.pathDestination, this.pathTrail ],
            alpha: 0.5,
            duration: 750,
            ease: 'Power2',
            yoyo: true,
            loop: -1,
            hold: 500
        });
    }

    calculatePath (start, end) {
        const startNode = this.getNode(start);
        const endNode = this.getNode(end);

        return astar.search(this.graph, startNode, endNode, {
            closest: true
        });
    }

    renderPath (path, { x = 0, y = 0 } = {}, speed = 6) {
        if (JSON.stringify(path) == this.pathCache) {
            return;
        }

        this.pathCache = JSON.stringify(path);

        this.pathTrail.clear();
        this.pathDestination.clear();

        const fillColour = path.length > speed ? 0xff0000 : 0x00ff00;
        this.pathTrail.fillStyle(fillColour, 1);
        this.pathDestination.lineStyle(5, fillColour, 1);

        const navPoints = path
            .map(({ x, y }) => new Phaser.Math.Vector2(
                Util.navPathToWorldCoord(x) + 25,
                Util.navPathToWorldCoord(y) + 25
            ));

        if (!navPoints.length) {
            return
        }

        navPoints.forEach(({ x, y }, i) => i < navPoints.length - 1 && this.pathTrail.fillCircle(x, y, 3.5));

        const targetPoint = navPoints[path.length - 1];

        const topLeftCornerSpline = new Phaser.Curves.Spline([
            new Phaser.Math.Vector2(targetPoint.x - 25, targetPoint.y - 10),
            new Phaser.Math.Vector2(targetPoint.x - 25, targetPoint.y - 20),
            new Phaser.Math.Vector2(targetPoint.x - 20, targetPoint.y - 25),
            new Phaser.Math.Vector2(targetPoint.x - 10, targetPoint.y - 25)
        ]);
        topLeftCornerSpline.draw(this.pathDestination, 5);

        const bottomLeftCornerSpline = new Phaser.Curves.Spline([
            new Phaser.Math.Vector2(targetPoint.x - 25, targetPoint.y + 10),
            new Phaser.Math.Vector2(targetPoint.x - 25, targetPoint.y + 20),
            new Phaser.Math.Vector2(targetPoint.x - 20, targetPoint.y + 25),
            new Phaser.Math.Vector2(targetPoint.x - 10, targetPoint.y + 25)
        ]);
        bottomLeftCornerSpline.draw(this.pathDestination, 5);

        const topRightCornerSpline = new Phaser.Curves.Spline([
            new Phaser.Math.Vector2(targetPoint.x + 25, targetPoint.y - 10),
            new Phaser.Math.Vector2(targetPoint.x + 25, targetPoint.y - 20),
            new Phaser.Math.Vector2(targetPoint.x + 20, targetPoint.y - 25),
            new Phaser.Math.Vector2(targetPoint.x + 10, targetPoint.y - 25)
        ]);
        topRightCornerSpline.draw(this.pathDestination, 5);

        const bottomRightCornerSpline = new Phaser.Curves.Spline([
            new Phaser.Math.Vector2(targetPoint.x + 25, targetPoint.y + 10),
            new Phaser.Math.Vector2(targetPoint.x + 25, targetPoint.y + 20),
            new Phaser.Math.Vector2(targetPoint.x + 20, targetPoint.y + 25),
            new Phaser.Math.Vector2(targetPoint.x + 10, targetPoint.y + 25)
        ]);
        bottomRightCornerSpline.draw(this.pathDestination, 5);
    }

    openNode ({ x = 0, y = 0 } = {}) {
        const node = this.getNode({ x, y });
        this.graph.openNode(node);

        return node;
    }

    closeNode ({ x = 0, y = 0 } = {}) {
        const node = this.getNode({ x, y });
        this.graph.closeNode(node);

        return node;
    }

    isAdjacent (start, end) {
        return this.calculatePath({ start, end }).length <= 1;
    }

    getNode ({ x = 0, y = 0 } = {}) {
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
