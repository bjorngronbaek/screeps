/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('upgrader'); // -> 'a thing'
 */

module.exports = function (creep) {
    var RoomAnalyzer = require('RoomAnalyzer');
    var roomAnalyzer = RoomAnalyzer.getRoomAnalyzer(creep.room);
    var DEBUG = 0;

    function log(creep, message) {
        if (DEBUG) {
            console.log('[TRANSPORTER] ' + creep.name + ': ' + message)
        }
    }

    creep.pos.createConstructionSite(STRUCTURE_ROAD);
    if (roomAnalyzer.storeageId != undefined) {
        var storage = Game.getObjectById(storeageId);
        if (storage.store.energy > 0) {
            creep.moveTo(storage);
            storage.transferEnergy(creep);
        }
    }
    else if (creep.carry.energy == 0 && creep.room.energyAvailable > 200) {
        var s = creep.pos.findClosest(FIND_MY_STRUCTURES, {
            filter: function (s) {
                if (s.energy && s.energy > 0) {
                    return true;
                }
                else {
                    return false;
                }
            }
        });
        if (s) {
            creep.memory.structureId = s.id;
        }
        if (s) {
            creep.moveTo(s);
            s.transferEnergy(creep);
        }
    }
    else {
        creep.moveTo(creep.room.controller);
        creep.upgradeController(creep.room.controller);
    }
};
