import "@babel/polyfill";

import * as server from './states/server';
import * as preloader from './states/preloader';
import * as level from './states/game';
import * as ui from './states/ui';
import * as gameover from './states/gameover';
import PawnManager from './pawn/PawnManager';
import Pathfinder from './components/Pathfinder';
import ActionBarPlugin from './plugins/ActionBar';

import packageJson from '../package.json';

window.client = undefined;
window.onload = () => {
    const game = new Phaser.Game({
        version: packageJson.version,
        height: window.innerHeight,
        parent: 'game',
        disableContextMenu: true,
        dom: {
            createContainer: true
        },
        render: {
            pixelArt: true,
            transparent: true,
            roundPixels: true,
        },
        scene: [
            server,
            preloader,
            level,
            ui,
            gameover
        ],
        plugins: {
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
                    key: 'ActionBar',
                    plugin: ActionBarPlugin,
                    mapping: 'actionBar'
                }
            ]
        },
        type: Phaser.AUTO,
        width: window.innerWidth
    });

    window.addEventListener('resize', () => game.resize(window.innerWidth, window.innerHeight), false);
};
