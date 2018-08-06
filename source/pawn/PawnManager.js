import Pawn from './Pawn';

export default class extends Phaser.Plugins.BasePlugin {

    start (client, pathfinder) {
        this.client = client;
        this.pathfinder = pathfinder;
        this.pawns = this.pluginManager.add.group();

        this.client.store.subscribe(() => this.sync(this.client.store.getState()));
        this.sync(this.client.store.getState());
    
        const {
            pluginManager: {
                scene: {
                    scene
                }
            }
        } = this;

        scene.input.keyboard.on('keydown_V', () =>
            this.pawns.children.each(pawn => pawn.data.set({
                showHealthBar: true
            }))
        )
        scene.input.keyboard.on('keyup_V', () =>
            this.pawns.children.each(pawn => pawn.data.set({
                showHealthBar: false
            }))
        )
    }

    add (options) {
        const id = options.id || Date.now().toString();
        const exists = this.get('id', id);

        if (typeof exists !== 'undefined') {
            return exists;
        }

        const pawn = new Pawn({
            ...options,
            id,
            client: this.client,
            game: this.pluginManager,
            manager: this,
            pathfinder: this.pathfinder
        });

        this.pawns.add(pawn, true);

        return pawn;
    }

    get (field, value) {
        if (field) {
            return this.pawns.children.get(field, value);
        }

        return this.pawns.getChildren();
    }

    sync ({
        G: {
            pawns
        }
    } = {}) {
        Object.keys(pawns)
            .forEach(id => {
                const pawn = this.get('id', id);

                if (typeof pawn !== 'undefined' || pawns[id].currentHealth <= 0) {
                    return;
                }

                return this.add({
                    ...pawns[id],
                    id
                });
            });
    }

}
