'use strict';

define(['io'], function (io) {
    return io.connect('http://ascension-server.dev:4000', {
        reconnection: true
    });
});
