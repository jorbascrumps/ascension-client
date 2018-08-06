export const key = 'UI';

let cachedPhase;

export function create () {
    this.actionBar.start(
        this.cameras.main.centerX,
        this.cameras.main.height,
        ({ target: { title: action } }) => {
            if ('' === action) {
                return;
            }

            const {
                client
            } = this.scene.get('LEVEL');

            if (action === 'Cancel') {
                return client.events.endPhase('Activation');
            }

            client.events.endPhase(action);
        }
    );
    this.currentPhase = this.add.text(10, 10, '', {
        fontSize: 10,
        fontFamily: 'Arial'
    });
}

export function update () {
    const currentPlayer = this.registry.get('player');
    const {
        client: {
            store: {
                getState
            }
        }
    } = this.scene.get('LEVEL');
    const {
        ctx
    } = getState();
    if (ctx.currentPlayer !== currentPlayer.id) {
        return this.currentPhase.setText('');
    }

    if (ctx.phase === cachedPhase) {
        return;
    }

    cachedPhase = ctx.phase;
    this.currentPhase.setText(`Phase: ${ctx.phase}`)
        .setFixedSize(2000, 0);;

    this.actionBar.setActions(actions[ctx.phase]);
}

const actions = {
    Restoration: [],
    Activation: [ 'Movement', 'Attack', 'Search' ],
    Movement: [ 'Cancel' ],
    Attack: [ 'Cancel' ],
    Search: [ 'Cancel' ]
};
