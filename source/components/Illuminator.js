export default class Illuminator {
    constructor ({
        game,
        blocked
    } = {}) {
        this.game = game;
        this.blocked = blocked;

        this.shadowColour = 'rgb(100, 100, 100)';
        this.lightColour = 'rgb(255, 255, 255)';

        this.setupEvents();

        this.fogOfWar = this.game.add.bitmapData(this.game.width, this.game.height);
        this.fogOfWar.context.fillStyle = this.lightColour;
        this.fogOfWar.context.strokeStyle = this.lightColour;

        const lightBitmap = this.game.add.image(0, 0, this.fogOfWar);
        lightBitmap.blendMode = Phaser.blendModes.MULTIPLY;

        this.rayCast = this.game.add.bitmapData(this.game.width, this.game.height);
        this.rayCastImage = this.game.add.image(0, 0, this.rayCast);
        this.rayCastImage.visible = false;
    }

    setupEvents = () => {
        this.game.input.onTap.add(this.toggleRays);
    }

    update = ({ target }) => {
        const _target = {
            x: target.x,
            y: target.y
        };

        this.fogOfWar.context.fillStyle = this.shadowColour;
        this.fogOfWar.context.fillRect(0, 0, this.game.width, this.game.height);

        const stageCorners = [
            new Phaser.Point(0, 0),
            new Phaser.Point(this.game.width, 0),
            new Phaser.Point(this.game.width, this.game.height),
            new Phaser.Point(0, this.game.height)
        ];
        const stageIntersections = stageCorners.reduce((cache, corner) => {
            const ray = new Phaser.Line(_target.x, _target.y, corner.x, corner.y);
            const intersect = this.getTileIntersection(ray);

            if (intersect) {
                return cache;
            }

            return [
                ...cache,
                corner
            ];
        }, []);

        const blockedIntersections = this.blocked.children.reduce((cache, tile) => {
            const corners = [
                new Phaser.Point(tile.x + 0.1, tile.y + 0.1),
                new Phaser.Point(tile.x - 0.1, tile.y - 0.1),

                new Phaser.Point(tile.x - 0.1 + tile.width, tile.y + 0.1),
                new Phaser.Point(tile.x + 0.1 + tile.width, tile.y - 0.1),

                new Phaser.Point(tile.x - 0.1 + tile.width, tile.y - 0.1 + tile.height),
                new Phaser.Point(tile.x + 0.1 + tile.width, tile.y + 0.1 + tile.height),

                new Phaser.Point(tile.x + 0.1, tile.y - 0.1 + tile.height),
                new Phaser.Point(tile.x - 0.1, tile.y + 0.1 + tile.height)
            ];

            const intersections = corners.map(corner => {
                const slope = (corner.y - _target.y) / (corner.x - _target.x);
                const b = _target.y - slope * _target.x;
                let end = null;

                if (corner.x === _target.x) {
                    if (corner.y <= _target.y) {
                        end = new Phaser.Point(_target.x, 0);
                    } else {
                        end = new Phaser.Point(_target.x, this.game.height);
                    }
                } else if (corner.y === _target.y) {
                    if (corner.x <= _target.x) {
                        end = new Phaser.Point(0, _target.y);
                    } else {
                        end = new Phaser.Point(this.game.width, _target.y);
                    }
                } else {
                    const left = new Phaser.Point(0, b);
                    const right = new Phaser.Point(this.game.width, slope * this.game.width + b);
                    const top = new Phaser.Point(-b / slope, 0);
                    const bottom = new Phaser.Point((this.game.height - b) / slope, this.game.height);

                    if (corner.y <= _target.y && corner.x >= _target.x) {
                        if (top.x >= 0 && top.x <= this.game.width) {
                            end = top;
                        } else {
                            end = right;
                        }
                    } else if (corner.y <= _target.y && corner.x <= _target.x) {
                        if (top.x >= 0 && top.x <= this.game.width) {
                            end = top;
                        } else {
                            end = left;
                        }
                    } else if (corner.y >= _target.y && corner.x >= _target.x) {
                        if (bottom.x >= 0 && bottom.x <= this.game.width) {
                            end = bottom;
                        } else {
                            end = right;
                        }
                    } else if (corner.y >= _target.y && corner.x <= _target.x) {
                        if (bottom.x >= 0 && bottom.x <= this.game.width) {
                            end = bottom;
                        } else {
                            end = left;
                        }
                    }
                }

                const ray = new Phaser.Line(_target.x, _target.y, end.x, end.y);
                const intersect = this.getTileIntersection(ray);

                return intersect || ray.end;
            });

            return [
                ...cache,
                ...intersections
            ];
        }, []);

        const points = [
            ...blockedIntersections,
            ...stageIntersections
        ]
            .sort(orderPointsAroundCenter({
                x: _target.x,
                y: _target.y
            }));

        this.fogOfWar.context.beginPath();
        this.fogOfWar.context.fillStyle = this.lightColour;
        this.fogOfWar.context.moveTo(points[0].x, points[0].y);
        points.forEach(point => this.fogOfWar.context.lineTo(point.x, point.y));
        this.fogOfWar.context.closePath();
        this.fogOfWar.context.fill();

        this.rayCast.context.clearRect(0, 0, this.game.width, this.game.height);
        this.rayCast.context.beginPath();
        this.rayCast.context.strokeStyle = this.lightColour;
        this.rayCast.context.fillStyle = this.lightColour;
        this.rayCast.context.moveTo(points[0].x, points[0].y);
        points.forEach(point => {
            this.rayCast.context.moveTo(_target.x, _target.y);
            this.rayCast.context.lineTo(point.x, point.y);
            this.rayCast.context.fillRect(point.x - 2, point.y - 2, 4, 4);
        });
        this.rayCast.context.stroke();

        this.rayCast.dirty = true;
        this.fogOfWar.dirty = true;
    }

    getTileIntersection = ray => {
        let distanceToTile = Number.POSITIVE_INFINITY;
        let closestIntersection = null;

        this.blocked.forEach(tile => {
            const lines = [
                new Phaser.Line(tile.x, tile.y, tile.x + tile.width, tile.y),
                new Phaser.Line(tile.x, tile.y, tile.x, tile.y + tile.height),
                new Phaser.Line(tile.x + tile.width, tile.y, tile.x + tile.width, tile.y + tile.height),
                new Phaser.Line(tile.x, tile.y + tile.height, tile.x + tile.width, tile.y + tile.height)
            ];

            lines.forEach(line => {
                const intersect = Phaser.Line.intersects(ray, line);

                if (!intersect) {
                    return;
                }

                const distance = this.game.math.distance(ray.start.x, ray.start.y, intersect.x, intersect.y);

                if (distance < distanceToTile) {
                    distanceToTile = distance;
                    closestIntersection = intersect;
                }
            });
        });

        return closestIntersection;
    }

    toggleRays = () => {
        this.rayCastImage.visible = !this.rayCastImage.visible;
    }
}

function orderPointsAroundCenter (center) {
    return (a, b) => {
        if (a.x - center.x >= 0 && b.x - center.x < 0) {
            return 1;
        }

        if (a.x - center.x < 0 && b.x - center.x >= 0) {
            return -1;
        }

        if (a.x - center.x === 0 && b.x - center.x === 0) {
            if (a.y - center.y >= 0 || b.y - center.y >= 0) {
                return 1;
            }

            return -1;
        }

        const det = (a.x - center.x) * (b.y - center.y) - (b.x - center.x) * (a.y - center.y);

        if (det < 0) {
            return 1;
        }

        if (det > 0) {
            return -1;
        }

        const d1 = (a.x - center.x) * (a.x - center.x) + (a.y - center.x) * (a.y - center.y);
        const d2 = (b.x - center.x) * (b.x - center.x) + (b.y - center.x) * (b.y - center.y);

        return 1;
    }
}
