'use strict';

define(['component/player/Player'], function (Player) {
    function Hero () {
    }

    Hero.prototype = Object.create(Player.prototype);
    Hero.prototype.constructor = Hero;

    return Hero;
});
