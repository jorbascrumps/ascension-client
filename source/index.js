import "@babel/polyfill";

import * as scene from './states/game';
import PawnManager from './pawn/PawnManager';

window.onload = () =>
    FBInstant.initializeAsync()
        .then(() =>
            new Phaser.Game({
                transparent: true,
                height: 500,
                parent: 'game',
                pixelArt: true,
                scene,
                plugins: {
                    scene: [
                        {
                            key: 'pawnManager',
                            plugin: PawnManager,
                            mapping: 'pawnManager'
                        }
                    ]
                },
                type: Phaser.AUTO,
                width: 500
            })
        );
