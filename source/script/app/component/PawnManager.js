'use strict';

define([
    'phaser',
    'component/DataStore',
    'component/Pawn',
    'component/Hero'
], function (
    Phaser,
    DataStore,
    Pawn,
    Hero
) {
    var _data = {};

    var PawnManager = {
        add: function (pawn, group) {
            if (!_data[group.name]) {
                _data[group.name] = {};
            }

            var existing = this.getFromGroup(group.name, pawn.id);
            if (existing) {
                return existing;
            }

            var session = DataStore.get('session');
            if (pawn.id == session) {
                _data[group.name][pawn.id] = new Hero(pawn, group);
            } else {
                _data[group.name][pawn.id] = new Pawn(pawn, group);
            }
        },

        remove: function (id) {
            Object.keys(_data).forEach(function (group) {
                Object.keys(_data[group]).forEach(function (pawn, index) {
                    if (pawn != id) {
                        return;
                    }

                    _data[group][pawn].kill();
                    delete _data[group][pawn];
                });
            });
        },

        getFromGroup: function (group, id) {
            if (!group) {
                return false;
            }

            return _data[group][id] || false;
        }
    };

    return PawnManager;
});
