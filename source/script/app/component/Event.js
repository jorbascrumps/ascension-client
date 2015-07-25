'use strict';

define(['phaser', 'smokesignals'], function (Phaser, smokesignals) {
    var Event = function () {
        return {};
    }

    smokesignals.convert(Event);

    return Event;
});
