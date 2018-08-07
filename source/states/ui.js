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

    this.registry.events.on('changedata', onChangeData, this);
    this.phaseContainer = this.add.container(0, this.cameras.main.height / 2)
        .setAlpha(0)
        .add([
            this.add.graphics(0, 0)
                .fillStyle(0x000000, 0.75)
                .fillRect(0, 0, this.cameras.main.width, 50),
            this.add.text(0, 0, 'test', {
                color: '#71f5a7'
            })
                .setOrigin(0.5, 0.5)
                .setPosition(this.cameras.main.width / 2, 25)
                .setName('label')
        ]);
}

function onChangeData (_, key, val) {
    switch (key) {
        case 'phase':
            this.phaseContainer
                .getByName('label')
                .setText(val.toUpperCase())
            return this.tweens.add({
                targets: this.phaseContainer,
                alpha: 1,
                yoyo: true,
                hold: 500,
                duration: 250
            })
    }
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
        this.actionBar.setActions();
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
