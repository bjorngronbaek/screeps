/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('guard'); // -> 'a thing'
 */

module.exports = function (creep) {
    var DEBUG = true;

    var BaseCreep = require('BaseCreep');
    var RoomAnalyzer = require('RoomAnalyzer');
    var roomAnalyzer = RoomAnalyzer.getRoomAnalyzer(creep.room);

    function log(creep, message) {
        if (DEBUG) {
            console.log('[GUARD] ' + creep.name + ': ' + message);
        }
    }

    function moveToRoom(creep) {
        var targetRoomPosition = creep.memory.targetRoomPosition;
        if (creep.memory.targetRoomPosition && creep.memory.targetRoomPosition != null && !creep.pos.isEqualTo(targetRoomPosition.pos.x, targetRoomPosition.pos.y) && targetRoomPosition.pos.roomName != creep.pos.roomName) {
            log(creep, "We have to move!")
            //are we in the right room?
            if (targetRoomPosition.pos.roomName != creep.pos.roomName) {
                log(creep, "not the right room")
                if (!creep.memory.exit || !creep.memory.exitCalcCounter || creep.memory.exitCalcCounter > 10) {
                    log(creep, "Finding an exit")
                    var exitDir = creep.room.findExitTo(targetRoomPosition.pos.roomName);
                    creep.memory.exit = creep.pos.findClosestByPath(exitDir);
                    creep.memory.exitCalcCounter = 0;
                }

                if(creep.memory.exit && creep.memory.exit != null) {
                    log(creep, "Using exit " + JSON.stringify(creep.memory.exit))
                    var r = creep.moveTo(creep.memory.exit.x, creep.memory.exit.y);
                    log(creep, "Moved " + r)
                    creep.memory.exitCalcCounter++;
                }
            }
            else {
                var result = creep.moveTo(targetRoomPosition.pos.x, targetRoomPosition.pos.y);
                log(creep, "In target room. curPos=" + JSON.stringify(creep.pos) + ", targetPos=" + JSON.stringify(targetRoomPosition) + " Moved=" + result)
            }
            return false;
        }
        else {
            log(creep, "is in target room!")
            creep.memory.targetRoomPosition = null;
            return true;
        }
    }

    function moveByMemoryPath(creep, pos) {
        log(creep, "moving by path")
        if (pos && (!creep.memory.path || !creep.memory.path.length || creep.memory.path == null)) {
            log(creep, "calculating path to pos=" + JSON.stringify(pos) + " from pos" + JSON.stringify(creep.pos))
            var path = creep.pos.findPathTo(pos.x, pos.y);
            if (path && path.length) {
                creep.memory.path = path;
            }
        }

        if (creep.fatigue === 0 && creep.memory.path != null && creep.memory.path.length) {
            var result = creep.move(creep.memory.path[0].direction);
            //log(creep,"moved="+result)
            if (result === OK) {
                //log(creep,"shifting")
                creep.memory.path.shift();
            }
        }

        //reset path
        if (!creep.memory.path || (creep.memory.path == null || !creep.memory.path.length || creep.pos.inRangeTo(pos, 4))) {
            log(creep, "resetting path")
            return false;
        }

        return true;
    }

    function isTargetInRange(creep) {
        var target = Game.getObjectById(creep.memory.targetId);
        return target ? creep.pos.isNearTo(target) : false;
    }

    function isTargetSet(creep) {
        var target = Game.getObjectById(creep.memory.targetId);
        return target ? true : false;
    }

    function findTarget(creep) {
        roomAnalyzer.analyzeHostiles();
        creep.memory.targetId = null;
        if (roomAnalyzer.result.hostiles.creeps.count > 0) {
            log(creep, "Found hostiles");
            var target;
            if (roomAnalyzer.result.hostiles.creeps.attackers.length > 0) {
                target = creep.pos.findClosestByPath(roomAnalyzer.result.hostiles.creeps.attackers);
            }
            else {
                target = creep.pos.findClosestByPath(roomAnalyzer.result.hostiles.creeps.all);
            }

            if (target) {
                creep.memory.targetId = target.id;
                creep.memory.targetPos = target.pos;
            }
        } else {
            //log(creep, "Found NO hostiles");
        }

        if (roomAnalyzer.result.hostiles.structures.count > 0 && !isTargetSet(creep)) {
            log(creep, "Found structures");
            if (roomAnalyzer.result.hostiles.structures.notRamparts.length > 0) {
                target = creep.pos.findClosestByPath(roomAnalyzer.result.hostiles.structures.notRamparts);
            }
            else {
                target = creep.pos.findClosestByPath(roomAnalyzer.result.hostiles.structures.all);
            }

            if (target) {
                creep.memory.targetId = target.id;
                creep.memory.targetPos = target.pos;
            }
        }
        else {
            //log(creep, "Found NO structures");
        }
    }

    var bc = new BaseCreep(creep);
    bc.log("Now using base!")
    if(moveToRoom(creep)) {

        if (!isTargetSet(creep)) {
            findTarget(creep);
        }

        if (isTargetSet(creep)) {
            if (isTargetInRange(creep)) {
                //attack the target
                var target = Game.getObjectById(creep.memory.targetId);
                creep.attack(target);
                creep.rangedAttack(target);
                creep.rangedMassAttack();
            }

            var result = moveByMemoryPath(creep, creep.memory.targetPos);
            if (!result) {
                log(creep, "No path to target... recalculate! " + result);
                findTarget(creep);
            }
        }
    }
}

