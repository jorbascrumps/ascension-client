'use strict';

define([
    'component/player/Player',
    'component/Event',
    'util/URL'
], function (
    Player,
    Event,
    URL
) {
    function Hero () {
        Player.call(this);
        console.warn('Creating [Hero] player');

        var pos = (Math.floor(Math.random() * 6) + 3) * 50;
        Event.emit('game.player.create', {
            room: URL.getParameter('room'),
            asset: URL.getParameter('sprite') == 1 ? 'nathan' : 'nega_nathan',
            position: {
                x: 2 * 50,
                y: pos
            }
        }, true);
    }

    Hero.prototype = Object.create(Player.prototype);
    Hero.prototype.constructor = Hero;

    return Hero;
});
