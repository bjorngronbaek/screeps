/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('guard'); // -> 'a thing'
 */

module.exports = function (creep) {
    var DEBUG = 1;

    var RoomAnalyzer = require('RoomAnalyzer');
    var roomAnalyzer = RoomAnalyzer.getRoomAnalyzer(creep.room);

    function log(creep, message) {
        if (DEBUG) {
            console.log('[GUARD] ' + creep.name + ': ' + message);
        }
    }

    function moveToFlag(creep) {
        var flag = Game.getObjectById(creep.memory.flag);
        if (flag) {
            log(creep, 'moving to ' + flag + ' from ' + creep.room);
            if (creep.memory.path === undefined || !creep.memory.path.length) {
                var exitDir = creep.room.findExitTo(flag.room);
                var exit = creep.pos.findClosestByPath(exitDir);
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

    function moveByMemoryPath(creep) {
        log(creep,"moving by path")
        var target = Game.getObjectById(creep.memory.targetId);
        if(!creep.memory.path || creep.pos.inRangeTo(target.pos,4)){
            log(creep,"calculating path")
            var path = creep.pos.findPathTo(target);
            if(path.length){
                creep.memory.path = path;
            }
        }
        if (creep.fatigue === 0 && creep.memory.path.length) {
            var result = creep.move(creep.memory.path[0].direction);
            log(creep,"moved="+result)
            if (result === OK) {
                log(creep,"shifting")
                creep.memory.path.shift();
            }
        }

        //reset path
        if (!creep.memory.path.length) {
            log(creep,"resetting path")
            creep.memory.path = null;
        }
    }

    function isTargetInRange(creep) {
        var target = Game.getObjectById(creep.memory.targetId);
        return target ? creep.pos.isNearTo(target) : false;
    }

    function isTargetSet(creep) {
        var target = Game.getObjectById(creep.memory.targetId);
        return target ? true : false;
    }

    function setTarget(creep) {
        roomAnalyzer.analyzeHostiles();
        if (roomAnalyzer.result.hostiles.creeps.count > 0) {
            log(creep, "Found hostiles");
            var target;
            if (roomAnalyzer.result.hostiles.creeps.attackers.length > 0) {
                target = creep.pos.findClosestByPath(roomAnalyzer.result.hostiles.creeps.attackers);
            }
            else {
                target = creep.pos.findClosestByPath(roomAnalyzer.result.hostiles.creeps.all);
            }
            creep.memory.targetId = target.id;
        } else {
            log(creep, "Found NO hostiles");
        }
    }

    if (creep.memory.flag != null && creep.memory.flag != undefined && creep.memory.flag != -1) {
        moveToFlag(creep);
    }
    else {
        if(!isTargetSet(creep)){
            setTarget(creep);
        }
        else if(isTargetInRange(creep)){
            //attack the target
            var target = Game.getObjectById(creep.memory.targetId);
            creep.attack(target)
            creep.rangedAttack(target)
            creep.rangedMassAttack()
        }
        else{
            moveByMemoryPath(creep);
        }

        /*
         var targets = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
         filter: function (creep) {
         return creep.owner.username != 'Source Keeper'
         }
         });
         if (!targets) {
         targets = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
         filter: function (s) {
         return s.structureType != STRUCTURE_RAMPART;
         }
         });
         }
         if (!targets) {
         targets = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
         }

         if (targets) {
         if (creep.pos.isNearTo(targets)) {
         creep.attack(targets);
         }
         else {
         creep.moveTo(targets);
         }
         }
         */
    }
}

