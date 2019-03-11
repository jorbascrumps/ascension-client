import qs from 'qs';

export const key = 'SERVER';

export function create () {
    const {
        room,
        player,
        settings: {
            animationSpeed = 1,
            disableFog = false,
        } = {}
    } = qs.parse(window.location.search.substr(1));

    this.registry.set('player', {
        id: player,
        room,
        isCurrentTurn: false
    });

    this.registry.set('settings', {
        disableFog: !!parseInt(disableFog, 10),
        animationSpeed: parseInt(animationSpeed, 10) || 1,
    });

    this.server.connect(room, player);

    this.server.subscribe(({ G: { map } }, unsubscribe) => {
        unsubscribe();

        this.registry.set('levelData', map);

        this.scene.launch('PRELOADER');
    });
}
