export const key = 'UI';

let cachedPhase;

export function create () {
    this.currentPhase = this.add.text(10, 10, '', {
        fontSize: 10,
        fontFamily: 'Arial'
    });
}

export function update () {
    const {
        client: {
            store: {
                getState
            }
        }
    } = this.scene.get('LEVEL');
    const {
        G,
        ctx
    } = getState();

    if (ctx.phase === cachedPhase) {
        return;
    }

    cachedPhase = ctx.phase;
    this.currentPhase.setText(`Phase: ${ctx.phase}`);
}
