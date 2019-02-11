import "@babel/polyfill";

import * as server from './states/server';
import * as preloader from './states/preloader';
import * as level from './states/game';
import * as ui from './states/ui';
import * as gameover from './states/gameover';
import PawnManager from './pawn/PawnManager';
import Pathfinder from './components/Pathfinder';
import MapManagerPlugin from './plugins/MapManager';

import packageJson from '../package.json';
import ListViewPlugin from 'phaser-plugin-list-view';

const height = 600;
const ratioWidth = 16;
const ratioHeight = 9;
const ratio = height / ratioHeight;
const width = ratio * ratioWidth;

window.client = undefined;
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
            mode: Phaser.Scale.FIT,
            parent: 'game',
            width,
        },
        scene: [
            server,
            preloader,
            level,
            ui,
            gameover
        ],
        plugins: {
            global: [
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
            ]
        },
        type: Phaser.AUTO,
        width: window.innerWidth
    });
};
