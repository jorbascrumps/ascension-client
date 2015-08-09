'use strict';

define(['io', 'component/DataStore'], function (io, DataStore) {
    var io = io.connect('http://ascension-server.dev:8080', {
        reconnection: true
    });

    io.on('connect', function () {
        DataStore.set('session', this.id);
    });

    return io;
});
