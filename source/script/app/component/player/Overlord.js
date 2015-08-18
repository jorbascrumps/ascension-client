'use strict';

define(['component/player/Player'], function (Player) {
    function Overlord () {
        Player.call(this);
        console.warn('Creating [Overlord] player');
    }

    Overlord.prototype = Object.create(Player.prototype);
    Overlord.prototype.constructor = Overlord;

    return Overlord;
});
