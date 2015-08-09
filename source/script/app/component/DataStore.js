'use strict';

define([], function () {
    var _data = {
        session: null
    };

    var DataStore = {
        get: function (key) {
            return _data[key];
        },

        set: function (key, value) {
            if (!_data.hasOwnProperty(key)) {
                throw Error('Cannot set property [' + key + ']');
            }

            return _data[key] = value;
        }
    };

    return DataStore;
});
