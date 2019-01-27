export const key = 'UI';

let cachedPhase;

export function create () {
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
    this.input.topOnly = false;

    this.actions = this.add.listview(10, 30, 150, 300)
        .on('pointerover', item => item.setAlpha(1))
        .on('pointerout', item => item.setAlpha(0.5))
        .on('pointerdown', (item, i) => {
            item.setAlpha(0.75)

            let next = item.getByName('action').text;
            if (next === 'Cancel') {
                next = 'Activation';
            }

            window.client.events.endPhase({
                next,
            });
        })
        .on('pointerup', item => item.setAlpha(1));
}

function onChangeData (_, key, val) {
    const {
        player
    } = this.registry.getAll();

    switch (key) {
        case 'phase':
            if (!player.isCurrentTurn) {
                return;
            }

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
    } = window;
    const {
        ctx
    } = getState();

    if (ctx.currentPlayer !== currentPlayer.id) {
        this.actions.clear()
        return this.currentPhase.setText('');
    }

    if (ctx.phase === cachedPhase) {
        return;
    }

    cachedPhase = ctx.phase;
    this.currentPhase.setText(`Phase: ${ctx.phase}`)
        .setFixedSize(2000, 0);

    const actionsControls = actions[ctx.phase]
        .map(action => {
            const text = this.add.text(0, 0, action, {
                fontSize: 20,
                fontFamily: 'Arial'
            })
                .setName('action')
                .setPadding({
                    bottom: 6,
                    left: 8,
                    right: 8,
                    top: 8
                });

            return this.add.container(0, 0)
                .add([
                    this.add.rectangle(0, 0, 150, text.displayHeight, 0x6666ff)
                        .setOrigin(0, 0),
                    text,
                ])
                .setAlpha(0.5)
        });

    this.actions
        .clear()
        .add(actionsControls)
}

const actions = {
    Restoration: [],
    Activation: [ 'Movement', 'Attack', 'Search' ],
    Movement: [ 'Cancel' ],
    Attack: [ 'Cancel' ],
    Search: [ 'Cancel' ]
};
