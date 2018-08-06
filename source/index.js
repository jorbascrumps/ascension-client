import "@babel/polyfill";

import * as level from './states/game';
import * as ui from './states/ui';
import PawnManager from './pawn/PawnManager';
import Pathfinder from './components/Pathfinder';
import ActionBarPlugin from './plugins/ActionBar';

window.onload = () => {
    const game = new Phaser.Game({
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
            level,
            ui
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
