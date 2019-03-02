import qs from 'querystring';

export const key = 'SERVER';

export function create () {
    const {
        disableFog = false,
        room,
        player,
    } = qs.parse(window.location.search.substr(1));

    this.registry.set('player', {
        id: player,
        room,
        isCurrentTurn: false
    });

    this.registry.set('settings', {
        disableFog,
    });

    this.server.connect(room, player);

    const {
        store: {
            getState,
            subscribe
        }
    } = this.server.client;

    const unsubscribe = subscribe(() => {
        unsubscribe();

        const {
            G
        } = getState();

        this.registry.set('levelData', G.map);

        this.scene.launch('PRELOADER');
    });
}
