import Pawn from '../pawn/Pawn';

export default class PawnManager {
    constructor ({
        game,
        store
    } = {}) {
        this.store = store;
        this.pawns = game.add.group(undefined, 'pawns');

        this.store.subscribe(this.sync);
    }

    add = ({
        sync = false,
        ...options
    }) => {
        if (sync) {
            return this.store.dispatch({
                type: 'PAWN_REGISTER',
                id: Date.now().toString(),
                sync,
                ...options
            });
        }

        const exists = this.pawns
            .filter(p => p.id === options.id)
            .first;

        if (exists) {
            return exists;
        }

        this.pawns.add(new Pawn({
            ...options,
            game: this.pawns.game
        }));
    }

    get = () => this.pawns

    sync = () => {
        const {
            pawn
        } = this.store.getState();

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
    }
}
