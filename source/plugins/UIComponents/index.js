import Button from './Button';

export default class UIComponents extends Phaser.Plugins.BasePlugin {

    constructor (scene, pluginManager) {
        super(scene, pluginManager);

        pluginManager.registerGameObject('button', this.createButton);
    }

    createButton (label, x, y) {
        const button = new Button(this.scene, label, x, y);

        this.displayList.add(button);

        return button;
    }

}
