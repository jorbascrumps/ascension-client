import * as PHASES from '../../core/common/constants/phases';
import items from '../../core/common/data/items';

export const key = 'UI';

let cachedPhase;

export function create () {
    const currentPlayer = this.registry.get('player');

    this.currentPhase = this.add.text(10, 10, '', {
        fontSize: 10,
        fontFamily: 'Arial'
    });

    this.registry.events.on('changedata-phase', onPhaseChange, this);
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

            let next = item.getByName('action').text.toLowerCase();
            if (next === 'cancel') {
                next = PHASES.ACTIVATION;
            }

            window.client.events.endPhase({
                next,
            });
        })
        .on('pointerup', item => item.setAlpha(1));

    // Setup temporary inventory UI for each owned Pawn
    const {
        pawnManager
    } = this.scene.get('LEVEL');
    pawnManager.getAll('owner', currentPlayer.id)
        .forEach((pawn, i) => {
            this[`inventory${pawn.id}`] = this.add.listview(200 * (i + 1), 30, 150, 150);
            pawn.data.events.on('changedata-inventory', onInventoryChange.bind(this))
        });
}

function onPhaseChange (_, next, prev) {
    const {
        player
    } = this.registry.getAll();

    if (!player.isCurrentTurn) {
        return;
    }

    this.phaseContainer
        .getByName('label')
        .setText(next.toUpperCase());

    return this.tweens.add({
        targets: this.phaseContainer,
        alpha: 1,
        yoyo: true,
        hold: 500,
        duration: 2500,
        properties: {
            alpha: {
                to: 1,
                from: 0.5
            }
        }
    });
}

function onInventoryChange (pawn, next, prev) {
    this[`inventory${pawn.id}`].clear(true, true);

    for (const id in next) {
        this[`inventory${pawn.id}`].add(
            this.add.text(0, 0, `${items[id].name} x ${next[id]}`, {
                fontSize: 20,
                fontFamily: 'Arial'
            })
        );
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
        this.actions.clear(true, true);
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
            const text = this.add.text(0, 0, action.toUpperCase(), {
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
        .clear(true, true)
        .add(actionsControls)
}

// TODO: Replace with ctx.allowedMoves
const actions = {
    [PHASES.RESTORATION]: [],
    [PHASES.ACTIVATION]: [ 'move', 'attack', 'search', 'tag' ],
    [PHASES.MOVEMENT]: [ 'cancel' ],
    [PHASES.ATTACK]: [ 'cancel' ],
    [PHASES.SEARCH]: [ 'cancel' ],
    [PHASES.TAG]: [ 'cancel' ],
};
