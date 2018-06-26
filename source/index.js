import "@babel/polyfill";

import * as level from './states/game';
import * as ui from './states/ui';
import PawnManager from './pawn/PawnManager';
import Pathfinder from './components/Pathfinder';

window.onload = () =>
    FBInstant.initializeAsync()
        .then(() =>
            new Phaser.Game({
                transparent: true,
                height: 500,
                parent: 'game',
                pixelArt: true,
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
                width: 500
            })
        );
