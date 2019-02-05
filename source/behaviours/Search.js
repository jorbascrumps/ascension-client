import State from './State';

export default class SearchState extends State {

    onEnter() {
        super.onEnter();

        this.target.sprite.setTint(0x0000ff);

        this.target.scene.input.on('pointerdown', this.onPointerDown, this);
    }

    onExit() {
        super.onExit();

        this.target.sprite.clearTint();

        this.target.scene.input.off('pointerdown', this.onPointerDown, this);
    }

    onPointerDown ({
        worldX,
        worldY
    } = {}) {
        const target = this.target.scene.interactionsLayer.getTileAtWorldXY(worldX, worldY);

        if (null === target) {
            return alert('Nothing to search!');
        }

        return this.target.client.moves.search({
            x: target.pixelX,
            y: target.pixelY
        });
    }

}
