import Pawn from '../pawn/Pawn';

export default class PawnManager {
    constructor ({
        scene,
        pathfinder,
        client
    } = {}) {
        this.scene = scene;
        this.client = client;
        this.pawns = scene.add.group();

        this.pathfinder = pathfinder;
        this.scene.sys.updateList.add(this.pathfinder);

        this.client.store.subscribe(() => this.sync(this.client.store.getState()));
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
            client: this.client,
            pathfinder: this.pathfinder.create(),
            manager: this
        });

        this.scene.sys.displayList.add(pawn);
        this.pawns.add(pawn);

        if (sync) {
            // TODO: Register new Pawns
            // this.store.dispatch({
            //     type: 'PAWN_REGISTER',
            //     id,
            //     sync,
            //     ...options
            // });
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
        G: {
            players
        }
    } = {}) => {
        Object.keys(players)
            .forEach(id => {
                const pawn = this.pawns.children.get('id', id);
                const player = players[id];

                if (typeof pawn === 'undefined') {
                    return this.add({
                        ...player,
                        id,
                        owner: id
                    });
                }

                pawn.moveToPath({
                    path: [ player.position ],
                    sync: false
                })
            });
    }
}
