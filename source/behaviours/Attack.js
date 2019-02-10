import State from './State';

export default class AttackState extends State {

    onEnter() {
        super.onEnter();

        this.target.sprite.setTint(0xff0000);

        this.target.scene.input.on('gameobjectdown', this.onPointerDown, this);

        this.target.scene.pawnManager.getAll('ownedByPlayer', false)
            .forEach(pawn => {
                pawn.on('pointerover', this.onPointerOver);
                pawn.on('pointerout', this.onPointerOut);
            });
    }

    onExit() {
        super.onExit();

        this.target.sprite.clearTint();

        this.target.scene.input.off('gameobjectdown', this.onPointerDown, this);

        this.target.scene.pawnManager.getAll('ownedByPlayer', false)
            .forEach(pawn => {
                pawn.off('pointerover', this.onPointerOver);
                pawn.off('pointerout', this.onPointerOut);
            });
    }

    onPointerDown (pointer, gameobject) {
        const attackTarget = this.target.scene.pawnManager.get({
            id: gameobject.id,
            ownedByPlayer: false,
        });

        if (!attackTarget) {
            return console.warn('No valid target');
        }

        // TODO: Pathfinding calculator to determine valid target
        return window.client.moves.attack(attackTarget.id);
    }

    onPointerOver () {
        this.sprite.setTint(0xff0000);
    }

    onPointerOut () {
        this.sprite.clearTint();
    }

}
