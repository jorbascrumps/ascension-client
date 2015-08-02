'use strict';

define(['component/Event'], function (Event) {
    var Chat = {
        send_btn: send,

        _send: function (message, sender) {
            Event.emit('chat.message.send', {
                message: message,
                sender: sender
            }, true);

            this._log(message, sender);
        },

        _log: function (message, sender) {
            if (!sender) {
                sender = 'System';
            }

            log.innerHTML += '\r\n' + sender + ': ' + message;
        },

        initialise: function () {
            var self = this;

            this._send(sender.value + ' has joined.');

            this.send_btn.addEventListener('click', function () {
                self._send(message.value, sender.value);
            });

            Event.on('chat.message.receive', function (payload) {
                self._log(payload.message, payload.sender);
            });
        }
    };

    return Chat;
});
