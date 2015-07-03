'use strict';

requirejs(['./config'], function (config) {
    requirejs(['app/game'], function (Game) {
        var game = new Game();
        game.start();
    });
});
