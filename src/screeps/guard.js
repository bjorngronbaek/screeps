/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('guard'); // -> 'a thing'
 */

module.exports = function (creep) {
    var DEBUG = true;

    var RoomAnalyzer = require('RoomAnalyzer');
    var roomAnalyzer = RoomAnalyzer.getRoomAnalyzer(creep.room);

    function log(creep, message) {
        if (DEBUG) {
            console.log('[GUARD] ' + creep.name + ': ' + message);
        }
    }

    function moveToRoom(creep) {
        if(creep.room.name != creep.memory.targetRoomName){
            log(creep,"Not in target room")
            var exitDir = creep.room.findExitTo(creep.memory.targetRoomName);
            var exit = creep.pos.findClosestByPath(exitDir);
            moveByMemoryPath(creep,exit.pos)
        }
    }

    function moveByMemoryPath(creep,pos) {
        log(creep,"moving by path")
        if(!creep.memory.path || !creep.memory.path.length || creep.memory.path == null || creep.pos.inRangeTo(pos,4)){
            log(creep,"calculating path")
            var path = creep.pos.findPathTo(pos);
            if(path.length){
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
        if (creep.memory.path == null || !creep.memory.path.length) {
            log(creep,"resetting path")
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

            if(target) {
                creep.memory.targetId = target.id;
            }
        } else {
            //log(creep, "Found NO hostiles");
        }

        if (roomAnalyzer.result.hostiles.structures.count > 0  && !isTargetSet(creep)){
            log(creep, "Found structures");
            if (roomAnalyzer.result.hostiles.structures.notRamparts.length > 0) {
                target = creep.pos.findClosestByPath(roomAnalyzer.result.hostiles.structures.notRamparts);
            }
            else {
                target = creep.pos.findClosestByPath(roomAnalyzer.result.hostiles.structures.all);
            }

            if(target) {
                creep.memory.targetId = target.id;
            }
        }
        else{
            //log(creep, "Found NO structures");
        }
    }

    if (creep.memory.flag != null && creep.memory.flag != undefined && creep.memory.flag != -1) {
        moveToRoom(creep);
    }
    else {
        if(!isTargetSet(creep)){
            findTarget(creep);
        }
        else if(isTargetInRange(creep)){
            //attack the target
            var target = Game.getObjectById(creep.memory.targetId);
            creep.attack(target)
            creep.rangedAttack(target)
            creep.rangedMassAttack()
        }
        else{
            var target = Game.getObjectById(creep.memory.targetId);
            var result = moveByMemoryPath(creep,target.pos);
            if(!result){
                log(creep,"No path to target... recalculate! "+result)
                findTarget(creep)
            }
        }
    }
}

