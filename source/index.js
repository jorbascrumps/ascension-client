import "@babel/polyfill";

import * as level from './states/game';
import * as ui from './states/ui';
import PawnManager from './pawn/PawnManager';
import Pathfinder from './components/Pathfinder';

window.onload = () =>
    FBInstant.initializeAsync()
        .then(() =>
            new Phaser.Game({
                height: 1000,
                parent: 'game',
                disableContextMenu: true,
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
                        }
                    ]
                },
                type: Phaser.AUTO,
                width: 1000
            })
        );
