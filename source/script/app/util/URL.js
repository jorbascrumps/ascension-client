'use strict';

define([], function () {
    var URL = {
        getParameter: function (field, url) {
            var href = url ? url : window.location.href
              , reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' )
              , string = reg.exec(href);

            return string ? string[1] : null;
        }
    };

    return URL;
});
