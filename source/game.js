export default {
    name: 'ascension',
    setup: () => ({
        players: [
            {
                name: 'One'
            },
            {
                name: 'Two'
            }
        ]
    }),
    moves: {
        movePawn (G, ctx, id, pos) {
            const {
                actions,
                ...currentPlayer
            } = G.players[id];

            return {
                ...G,
                players: G.players.map((player, i) =>
                    i == id
                        ?   { ...player, actions: actions - 1 }
                        :   player
                )
            };
        }
    },
    flow: {
        onTurnBegin (G, ctx) {
            return {
                ...G,
                players: G.players.map((player, i) =>
                    i == ctx.currentPlayer
                        ?   { ...player, actions: 1 }
                        :   player
                )
            };
        },
        endTurnIf (G, ctx) {
            const currentPlayer = G.players[ctx.currentPlayer];

            return currentPlayer.actions <= 0;
        }
    }
};
