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
    var BaseCreep = require("BaseCreep");
    var upgrader = new BaseCreep(creep);
    var DEBUG = 0;

    creep.pos.createConstructionSite(STRUCTURE_ROAD);
    if (roomAnalyzer.storeageId != undefined) {
        var storage = Game.getObjectById(roomAnalyzer.storeageId);
        if (storage.store.energy > 0) {
            upgrader.moveByMemoryPath(storage.pos);
            storage.transferEnergy(creep);
        }
    }
    else if (creep.carry.energy == 0 && creep.room.energyAvailable > 200) {
        var s = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
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
            upgrader.moveByMemoryPath(s.pos);
            s.transferEnergy(creep);
        }
    }
    else {
        upgrader.moveByMemoryPath(creep.room.controller.pos);
        creep.upgradeController(creep.room.controller);
    }
};