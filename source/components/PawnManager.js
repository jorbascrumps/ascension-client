import Pawn from '../pawn/Pawn';

export default class PawnManager {
    constructor ({
        game,
        store
    } = {}) {
        this.store = store;
        this.pawns = game.add.group(undefined, 'pawns');

        this.store.subscribe(() => this.sync(this.store.getState()));
    }

    add = ({
        sync = false,
        ...options
    }) => {
        const exists = this.pawns
            .filter(p => p.id === options.id)
            .first;

        if (exists) {
            return exists;
        }

        const id = options.id || Date.now().toString();

        this.pawns.add(new Pawn({
            ...options,
            id,
            game: this.pawns.game
        }));

        if (sync) {
            return this.store.dispatch({
                type: 'PAWN_REGISTER',
                id,
                sync,
                ...options
            });
        }
    }

    get = () => this.pawns

    sync = ({
        pawn,
        user
    }) => {
        const newIds = Object.keys(pawn);
        const oldIds = this.pawns.children
            .map(p => p.id);

        const t = this.pawns.children
            .filter(({ id }) => newIds.indexOf(id) < 0)
            .forEach(pawn => this.pawns.remove(pawn, true));

        const newPawns = newIds
            .filter(id => oldIds.indexOf(id) < 0)
            .map(id => this.add({
                ...pawn[id],
                id,
                sync: false
            }));

        this.pawns.children
            .forEach(p => {
                if (p.owner === user.session) {
                    return;
                }

                p.moveTo(pawn[p.id].position);
            });
    }
}
