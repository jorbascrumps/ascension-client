'use strict';

requirejs(['./config'], function (config) {
    requirejs([
        'app/menu',
        'app/board'
    ]);
});
