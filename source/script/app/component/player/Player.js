'use strict';

define([
    'phaser',
    'component/Event',
    'util/URL'
], function (
    Phaser,
    Event,
    URL
) {
    function Player () {
        Event.emit('game.player.create', {
            room: URL.getParameter('room')
        }, true);
    }

    return Player;
});
