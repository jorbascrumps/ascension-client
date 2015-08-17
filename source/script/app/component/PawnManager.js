'use strict';

define(['phaser'], function (Phaser) {
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

            return _data[group.name][pawn.id] = group.create(
                pawn.transform.position.x,
                pawn.transform.position.y,
                pawn.asset
            );
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
