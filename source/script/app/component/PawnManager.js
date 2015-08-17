'use strict';

define([
    'phaser',
    'component/DataStore',
    'component/Hero'
], function (
    Phaser,
    DataStore,
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
                _data[group.name][pawn.id] = group.create(
                    pawn.transform.position.x,
                    pawn.transform.position.y,
                    pawn.asset
                );
            } else {
                _data[group.name][pawn.id] = group.create(
                    pawn.transform.position.x,
                    pawn.transform.position.y,
                    pawn.asset
                );
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
