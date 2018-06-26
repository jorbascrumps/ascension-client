export const key = 'UI';

let cachedPhase;

export function create () {
    this.currentPhase = this.add.text(10, 10, '', {
        fontSize: 10,
        fontFamily: 'Arial'
    });

    this.availableActions = this.add.group();

    this.input.on('gameobjectover', (p, o) => o.setTint(0x00ff00));
    this.input.on("gameobjectout", (p, o) => o.clearTint());
    this.input.on('gameobjectdown', (p, { text: action = '' }) => {
        const {
            client
        } = this.scene.get('LEVEL');

        client.events.endPhase(action);
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

    if (ctx.currentPlayer !== FBInstant.player.getID().toString()) {
        return this.availableActions.clear(true);
    }

    if (ctx.phase === cachedPhase) {
        return;
    }

    cachedPhase = ctx.phase;
    this.currentPhase.setText(`Phase: ${ctx.phase}`);

    this.availableActions.clear(true);
    const availableActions = actions[ctx.phase];
    availableActions
        .reverse()
        .forEach((action, i) =>
            this.availableActions.add(
                this.add.text(this.cameras.main.width - 10, this.cameras.main.width - (24 * i), action, {
                    fontSize: 16,
                    fontFamily: 'Arial'
                })
                    .setOrigin(1, 1)
                    .setInteractive({
                        useHandCursor: true
                    }),
                true
            )
        );
}

const actions = {
    Activation: [ 'Movement' ],
    Movement: []
};
