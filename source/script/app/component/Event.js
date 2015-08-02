'use strict';

define(['phaser', 'smokesignals', 'component/Socket'], function (Phaser, smokesignals, io) {
    var _internal = smokesignals.convert({}),
        _network = io;

    return {
        emit: function (event_name, payload, network_event) {
            _internal.emit(event_name, payload);

            if (!!network_event) {
                _network.emit(event_name, payload);
            }
        },

        on: function (event_name, handler) {
            _internal.on(event_name, handler);
            _network.on(event_name, handler);
        }
    };
});
