/**
 * Created by Bj�rn on 27-09-2015.
 */

var BaseCreep = function(creep) {
    this.creep = creep;
    this.memoryProp = creep.memory;
    this.DEBUG = true;
};

module.exports = BaseCreep;

BaseCreep.prototype.log = function(message) {
    if (this.DEBUG) {
        console.log('[' + this.memoryProp.role + '] ' + this.creep.name + ': ' + message);
    }
};

BaseCreep.prototype.moveToTarget = function() {
    var targetRoomPosition = this.creep.memory.targetRoomPosition;
    if (targetRoomPosition && targetRoomPosition != null && !creep.pos.isEqualTo(targetRoomPosition.pos.x, targetRoomPosition.pos.y) && targetRoomPosition.pos.roomName != creep.pos.roomName) {
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

            if (creep.memory.exit && creep.memory.exit != null) {
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
};