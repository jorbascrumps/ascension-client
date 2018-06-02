import Pawn from '../pawn/Pawn';

export default class PawnManager {
    constructor ({
        scene,
        store,
        pathfinder,
        client
    } = {}) {
        this.scene = scene;
        this.store = store;
        this.client = client;
        this.pawns = scene.add.group();

        this.pathfinder = pathfinder;
        this.scene.sys.updateList.add(this.pathfinder);

        this.store.subscribe(() => this.sync(this.store.getState()));
    }

    add = ({
        sync = false,
        ...options
    } = {}) => {
        const exists = this.pawns.getChildren()
            .find(p => p.id === options.id);

        if (typeof exists !== 'undefined') {
            return exists;
        }

        const id = options.id || Date.now().toString();
        const pawn = new Pawn({
            ...options,
            id,
            game: this.scene,
            store: this.store,
            client: this.client,
            pathfinder: this.pathfinder.create(),
            manager: this
        });

        this.scene.sys.displayList.add(pawn);
        this.pawns.add(pawn);

        if (sync) {
            this.store.dispatch({
                type: 'PAWN_REGISTER',
                id,
                sync,
                ...options
            });
        }

        return pawn;
    }

    remove = pawn => {
        this.scene.sys.displayList.remove(pawn);
        this.pawns.remove(pawn);
    }

    get = () => this.pawns.getChildren()

    getByID = id => this.get().find(c => c.id === id)

    sync = ({
        pawn,
        user
    } = {}) => {
        const newIds = Object.keys(pawn);
        const oldIds = this.pawns.getChildren()
            .map(p => p.id);

        const removedPawns = this.pawns.getChildren()
            .filter(({ id }) => newIds.indexOf(id) < 0)
            .forEach(pawn => this.remove(pawn));

        const addedPawns = newIds
            .filter(id => oldIds.indexOf(id) < 0)
            .map(id => this.add({
                ...pawn[id],
                id,
                sync: false
            }));

        // Move Pawns that don't belong to user
        this.pawns.getChildren()
            .filter(p => p.owner !== user.session)
            .forEach(p => p.moveToPath({
                path: [ pawn[p.id].position ]
            }));
    }
}
