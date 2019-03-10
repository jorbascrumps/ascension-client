import "@babel/polyfill";


import * as states from './states';

import PawnManager from './pawn/PawnManager';
import Pathfinder from './components/Pathfinder';
import MapManagerPlugin from './plugins/MapManager';
import ServerPlugin from './plugins/Server';
import UIComponentsPlugin from './plugins/UIComponents';

import packageJson from '../package.json';
import ListViewPlugin from 'phaser-plugin-list-view';

const height = 600;
const ratioWidth = 16;
const ratioHeight = 9;
const ratio = height / ratioHeight;
const width = ratio * ratioWidth;

window.onload = () => {
    const game = new Phaser.Game({
        version: packageJson.version,
        height: window.innerHeight,
        disableContextMenu: true,
        dom: {
            createContainer: true
        },
        render: {
            pixelArt: true,
            transparent: true,
            roundPixels: true,
        },
        scale: {
            autoCenter: Phaser.Scale.CENTER_BOTH,
            height,
            max: {
                height,
                width,
            },
            mode: Phaser.Scale.FIT,
            parent: 'game',
            width,
        },
        scene: Object.values(states),
        plugins: {
            global: [
                {
                    key: 'serverPlugin',
                    plugin: ServerPlugin,
                    mapping: 'server',
                    start: false,
                },
            ],
            scene: [
                {
                    key: 'pawnManager',
                    plugin: PawnManager,
                    mapping: 'pawnManager'
                },
                {
                    key: 'pathfinder',
                    plugin: Pathfinder,
                    mapping: 'pathfinder'
                },
                {
                    key: 'ListView',
                    plugin: ListViewPlugin,
                    start: true
                },
                {
                    key: 'mapManager',
                    plugin: MapManagerPlugin,
                    start: true,
                },
                {
                    key: 'uicomponent',
                    plugin: UIComponentsPlugin,
                    start: true,
                },
            ]
        },
        type: Phaser.AUTO,
        width: window.innerWidth
    });
};
