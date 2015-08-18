'use strict';

define(['component/player/Player'], function (Player) {
    function Hero () {
        Player.call(this);
        console.warn('Creating [Hero] player');
    }

    Hero.prototype = Object.create(Player.prototype);
    Hero.prototype.constructor = Hero;

    return Hero;
});
