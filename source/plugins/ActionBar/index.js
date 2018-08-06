import template from 'lodash/template';
import forEach from 'lodash/forEach';

const VIEW = 'ActionBar_view';

export default class extends Phaser.Plugins.ScenePlugin {
    
    constructor (scene, pluginManager) {
        super(scene, pluginManager);

        this.bar;
        this.template;
        this.onClick = () => {};

        scene.load.once('filecomplete', () => {
            scene.load.html(VIEW, '/source/plugins/ActionBar/view.html');
        });
    }
    
    start (x = 0, y = 0, onClick = () => {}) {
        const source = this.scene.cache.html.get(VIEW);
        this.template = template(source, {
            imports: {
                forEach
            }
        });
        this.onClick = onClick;

        this.create(x, y);

        return this;
    }

    setActions (actions = []) {
        this.bar.parent.innerHTML = '';
        this.bar
            .createFromHTML(this.template({
                actions
            }))
            .addListener('click')
            .on('click', this.onClick);

        return this;
    }

    create (x = 0, y = 0) {
        this.bar = this.scene.add.dom(x, y)
            .setOrigin(0.5, 1)
            .setY(y);

        return this.bar;
    }
    
}
