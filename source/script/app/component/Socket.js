'use strict';

define(['io'], function (io) {
    return io.connect('http://ascension-server.dev:8080', {
        reconnection: true
    });
});
