'use strict';

define(['component/Event'], function (Event) {
    var Chat = {
        send_btn: send,

        _send: function (message) {
            Event.emit('chat.message.send', {
                message: message
            }, true);

            this._log(message);
        },

        _log: function (message) {
            log.innerHTML += '\r\n' + message;
        },

        initialise: function () {
            var self = this;

            this.send_btn.addEventListener('click', function () {
                self._send(message.value);
            });

            Event.on('chat.message.receive', function (payload) {
                self._log(payload.message);
            });
        }
    };

    return Chat;
});
