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
    var targetRoomPosition = this.memoryProp.targetRoomPosition;
    if (targetRoomPosition) {
        this.log("We have to move!")
        if (targetRoomPosition.pos.roomName != this.creep.pos.roomName) {
            this.log("not the right room")
            if (!this.memoryProp.exit || !this.memoryProp.exitCalcCounter || this.memoryProp.exitCalcCounter > 10) {
                this.log("Finding an exit")
                var exitDir = this.creep.room.findExitTo(targetRoomPosition.pos.roomName);
                this.memoryProp.exit = this.creep.pos.findClosestByPath(exitDir);
                this.memoryProp.exitCalcCounter = 0;
            }

            if (this.memoryProp.exit && this.memoryProp.exit != null) {
                this.log("Using exit " + JSON.stringify(this.memoryProp.exit))
                var r = this.creep.moveTo(this.memoryProp.exit.x, this.memoryProp.exit.y);
                this.log("Moved " + r)
                this.memoryProp.exitCalcCounter++;
            }
        }
        else {
            this.log("the rigth room");
            var result = this.creep.moveTo(targetRoomPosition.pos.x, targetRoomPosition.pos.y);
            this.log("In target room. curPos=" + JSON.stringify(this.creep.pos) + ", targetPos=" + JSON.stringify(targetRoomPosition) + " Moved=" + result)
        }
        return false;
    }
};

BaseCreep.prototype.moveByMemoryPath = function (pos) {
    this.log("Moving by path");
    if (pos && (!this.memoryProp.path  || !this.memoryProp.path.length)) {
        this.log("Calculating path to pos=" + JSON.stringify(pos) + " from pos" + JSON.stringify(this.creep.pos));
        var path = this.creep.pos.findPathTo(pos.x, pos.y);
        if (path && path.length) {
            this.memoryProp.path = path;
        }
    }

    if (this.creep.fatigue === 0 && this.memoryProp.path  && this.memoryProp.path.length) {
        var result = this.creep.move(this.memoryProp.path[0].direction);
        if (result === OK) {
            this.memoryProp.path.shift();
        }
    }

    //reset path
    if (!this.memoryProp.path || !this.memoryProp.path.length || this.creep.pos.inRangeTo(pos, 4)) {
        this.log("Resetting path");
        return false;
    }

    return true;
};