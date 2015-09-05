/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('guard'); // -> 'a thing'
 */

module.exports = function (creep) {
    var DEBUG = 1;

    function log(creep, message) {
        if (DEBUG) {
            console.log('[GUARD] ' + creep.name + ': ' + message);
        }
    }

    if (creep.memory.flag != null && creep.memory.flag != undefined && creep.memory.flag != -1) {
        var flag = Game.getObjectById(creep.memory.flag);
        log(creep, 'moving to ' + flag + ' from ' + creep.room);
        if (flag) {
            if (creep.memory.path === undefined || !creep.memory.path.length) {
                var exitDir = creep.room.findExitTo(flag.room);
                var exit = creep.pos.findClosest(exitDir);
                if (exit) {
                    var path = creep.pos.findPathTo(exit, {
                        maxOps: 1000,
                        ignoreDestructibleStructures: true,
                        ignoreCreeps: true
                    });
                }
                log(creep, 'Calculating path to ' + JSON.stringify(path));
                creep.memory.path = path;
            }
            else {
                //log(creep,'path is '+JSON.stringify(creep.memory.path));
                var goto = creep.memory.path.shift();
                log(creep, 'going to ' + JSON.stringify(goto))
                var result = creep.move(goto.direction);
                log(creep, result);
            }
            log(creep, 'moving to ' + flag.room + ' from ' + creep.room + ' exit=' + exit);

            if (creep.room == flag.room) {
                log(creep, 'is arrived');
                creep.memory.flag = -1;
                creep.memory.structureId = -1;
                creep.memory.siteId = -1;
            }
        }
    }
    else {

        var targets = creep.pos.findClosest(FIND_HOSTILE_CREEPS, {
            filter: function (creep) {
                return creep.owner.username != 'Source Keeper'
            }
        });
        if (!targets) {
            targets = creep.pos.findClosest(FIND_HOSTILE_STRUCTURES, {
                filter: function (s) {
                    return s.structureType != STRUCTURE_RAMPART;
                }
            });
        }
        if (!targets) {
            targets = creep.pos.findClosest(FIND_HOSTILE_STRUCTURES);
        }

        if (targets) {
            if (creep.pos.isNearTo(targets)) {
                creep.attack(targets);
            }
            else {
                creep.moveTo(targets);
            }
        }
    }
}
