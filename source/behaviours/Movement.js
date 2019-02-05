import State from './State';
import * as Util from '../components/Util';

export default class MovementState extends State {

    onEnter() {
        super.onEnter();

        this.target.sprite.setTint(0x00ff00);

        this.target.scene.input.on('pointermove', this.onPointerMove, this);
        this.target.scene.input.on('pointerdown', this.onPointerDown, this);
    }

    onExit() {
        super.onExit();

        this.target.sprite.clearTint();

        this.target.scene.input.off('pointermove', this.onPointerMove, this);
        this.target.scene.input.off('pointerdown', this.onPointerDown, this);
    }

    onPointerMove ({
        worldX: x = 0,
        worldY: y = 0
    } = {}) {
        this.target.navPath = this.target.pathfinder.calculatePath(
            {
                x: Util.navPathToWorldCoord(Math.floor(this.target.x / 50)),
                y: Util.navPathToWorldCoord(Math.floor(this.target.y / 50))
            },
            {
                x,
                y
            }
        );
    }

    onPointerDown () {
        if (!this.target.navPath.length || this.target.navPath.length > this.target.speed) {
            return;
        }

        const path = this.target.navPath.map(({ x, y }) => ({
            x: Util.navPathToWorldCoord(x),
            y: Util.navPathToWorldCoord(y)
        }));

        this.target.moveToPath(path);
    }

}
