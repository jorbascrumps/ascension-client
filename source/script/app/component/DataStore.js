'use strict';

define([], function () {
    var _data = {};

    var DataStore = {
        get: function (key) {
            return _data[key];
        },

        set: function (key, value) {
            return _data[key] = value;
        }
    };

    return DataStore;
});
