'use strict';

define(['component/player/Player'], function (Player) {
    function Overlord () {
    }

    Overlord.prototype = Object.create(Player.prototype);
    Overlord.prototype.constructor = Overlord;

    return Overlord;
});
