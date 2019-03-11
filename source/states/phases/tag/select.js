import {
    key as PLACE,
} from './place';

export const key = 'TAG';

export function create () {
    const currentPlayer = this.registry.get('player');

    const {
        G: {
            cards: availableCards,
            players: {
                [currentPlayer.id]: {
                    cards: playerCards = [],
                    ...playerData
                } = {},
            } = {},
        } = {},
    } = this.server.client.store.getState();

    this.playerCards = this.add.group();
    playerCards
        .map(id => ({
            id,
            ...availableCards[id],
        }))
        .map(({ id, name, }) => {
            const card = this.add.image(0, 0, 'overlord_card')
                .setInteractive({
                    useHandCursor: true,
                })
                .setDataEnabled()
                .on('pointerover', onCardOver)
                .on('pointerout', onCardOut)
                .on('pointerdown', onCardDown)
            ;

            card.data.set({
                id,
                tooltip: name,
            });

            return this.playerCards.add(card);
        });
    Phaser.Actions.GridAlign(this.playerCards.getChildren(), {
        width: 6,
        height: 2,
        cellHeight: 170,
        cellWidth: 128,
        x: 75,
        y: 510,
    });
}

function onCardOver () {
    this
        .setScale(1.025)
        .setTint(0xff0000);
}

function onCardOut () {
    this
        .clearTint()
        .setScale(1);
}

function onCardDown () {
    const {
        id,
    } = this.data.getAll();

    this.scene.scene.start(PLACE, {
        card: id,
    });
}

/*
    this.tooltip = this.add.text(50, 50, undefined, {
        backgroundColor: 'rgb(0, 0, 0, 0.5)',
        fontSize: 12,
        fontFamily: 'Arial',
        padding: {
            top: 6,
            right: 10,
            bottom: 6,
            left: 10,
        },
        wordWrap: {
            width: 125,
        },
    })
        .setOrigin(0.5, 1)
        .setVisible(false);
    this.input.on('gameobjectover', (pointer, target) => {
        const {
            values: {
                tooltip,
            } = {},
        } = target.data || {};

        if (!tooltip) {
            return;
        }

        this.tooltip
            .setPosition(target.x, target.y - target.displayOriginY - 6)
            .setText(tooltip)
            .setVisible(true);
    });
    this.input.on('gameobjectout', (pointer, target) => {
        const {
            values: {
                tooltip,
            } = {},
        } = target.data || {};

        if (!tooltip) {
            return;
        }

        this.tooltip
            .setVisible(false);
    });
*/
