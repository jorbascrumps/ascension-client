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
    }

    Hero.prototype = Object.create(Player.prototype);
    Hero.prototype.constructor = Hero;

    return Hero;
});
