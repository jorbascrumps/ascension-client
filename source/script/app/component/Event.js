'use strict';

define(['phaser', 'smokesignals', 'component/Socket'], function (Phaser, smokesignals, io) {
    return {
        _internal: smokesignals.convert({}),
        _network: io,

        emit: function (event_name, payload, network_event) {
            this._internal.emit(event_name, payload);

            if (!!network_event) {
                this._network.emit(event_name, payload);
            }
        },

        on: function (event_name, handler) {
            this._internal.on(event_name, handler);
            this._network.on(event_name, handler);
        }
    }
});
