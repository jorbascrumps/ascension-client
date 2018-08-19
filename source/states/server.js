import qs from 'querystring';
import {
    default as c
} from 'boardgame.io/client';
import {
    default as b
} from 'boardgame.io/core';
import gameConfig from '../../core/common/game';

export const key = 'SERVER';

export function create () {
    const {
        room,
        player
    } = qs.parse(window.location.search.substr(1));

    this.registry.set('player', {
        id: player,
        room,
        isCurrentTurn: false
    });

    const game = gameConfig();
    window.client = c.Client({
        game: b.Game(game),
        multiplayer: {
            server: 'https://ascension-server.herokuapp.com'
        },
        gameID: room,
        playerID: player
    });
    window.client.connect();

    const {
        store: {
            getState,
            subscribe
        }
    } = window.client;

    const unsubscribe = subscribe(() => {
        unsubscribe();

        const {
            G
        } = getState();

        console.log(G);
        this.registry.set('levelData', {
            blocked: G.blocked,
            interactions: G.interactions,
            map: G.map
        });
        
        this.scene.launch('PRELOADER');
    });
}
