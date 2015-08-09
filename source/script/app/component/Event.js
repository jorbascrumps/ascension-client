'use strict';

define(['phaser', 'smokesignals', 'component/Socket'], function (Phaser, smokesignals, io) {
    var _internal = smokesignals.convert({}),
        _network = io,
        _timeout = 5000;

    _network.on('disconnect', function () {
        Event.emit('network.connection.disconnect', {
            message: 'Lost connection with server. Attempting to reconnect..'
        });

        var reconnect = setInterval(function (network) {
            if (!network.connected) {
                Event.emit('network.connection.reconnect', {
                    message: 'Attempt to reconnect failed. Trying again in ' + (_timeout / 1000) + ' seconds..'
                });

                return;
            }

            clearInterval(reconnect);
            network.io.reconnect();
            Event.emit('network.connection.connect', {
                message: 'Successfully reconnected.'
            });
        }, _timeout, _network);
    });

    var Event = {
        emit: function (event_name, payload, network_event) {
            if (!!network_event) {
                _network.emit(event_name, payload);
            } else {
                _internal.emit(event_name, payload);
            }
        },

        on: function (event_name, handler, network_event) {
            if (!!network_event) {
                _network.on(event_name, handler);
            } else {
                _internal.on(event_name, handler);
            }
        }
    };

    return Event;
});
