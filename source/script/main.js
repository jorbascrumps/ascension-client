'use strict';

require(['./config'], function (config) {
    require(['app/game', 'ui/Chat'], function (Game, Chat) {
        var game = new Game();
        game.start();

        Chat.initialise();
    });
});
