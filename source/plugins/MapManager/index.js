import Map from './Map';

export default class MapPlugin extends Phaser.Plugins.BasePlugin {

    constructor (scene, pluginManager) {
        super(scene, pluginManager);

        pluginManager.registerGameObject('map', this.createMap);
    }

    createMap (width, height, rooms) {
        const map = new Map({
            id: Date.now(),
            context: this.scene,
            height,
            width,
            rooms,
        });

        return map;
    }

}
