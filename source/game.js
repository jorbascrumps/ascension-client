export default scene => ({
    name: 'ascension',
    setup: () => ({
        players: [
            {
                name: 'One',
                position: {
                    x: 0,
                    y: 0
                }
            },
            {
                name: 'Two',
                position: {
                    x: 0,
                    y: 0
                }
            }
        ]
    }),
    moves: {
        movePawn: (G, ctx, id, position) => ({
            ...G,
            players: G.players.map((player, i) => ({
                ...player,
                actions: i === parseInt(id, 10)
                    ?   player.actions - 1
                    :   player.actions,
                position: i === parseInt(id, 10)
                    ?   position
                    :   player.position
            }))
        }),
        attack (G, ctx, {
            targetId,
            damage = 0
        } = {}) {
            scene.events.emit('ATTACK_PAWN', targetId);

            return {
                ...G,
                players: G.players.map((player, i) => ({
                    ...player,
                    actions: i == ctx.currentPlayer
                        ?   player.actions - 1
                        :   player.actions
                }))
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
});
