'use strict';

require(['./config'], function (config) {
    require(['app/game'], function (Game) {
        var game = new Game();
        game.start();
    });
});
