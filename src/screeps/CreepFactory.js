module.exports = (function () {
    var RoomAnalyzer = require('RoomAnalyzer');

    function CreepFactory() {
    }

    CreepFactory.prototype.spawnWorker = function spawnWorker(spawn) {
        var roomAnalyzer = RoomAnalyzer.getRoomAnalyzer(spawn.room);
        var st = [WORK, CARRY, MOVE];
        var mt = [WORK, CARRY, CARRY, MOVE, MOVE];
        var bt = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE];
        var ebt = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, WORK, CARRY, MOVE];

        //console.log('creating worker');
        if (roomAnalyzer.extensionCount >= 10 && spawn.canCreateCreep(ebt) == 0) {
            console.log('creating big worker');
            return spawn.createCreep(ebt, null, {role: 'worker'});
        }
        else if (roomAnalyzer.extensionCount >= 10 && spawn.canCreateCreep(bt) == 0) {
            console.log('creating big worker');
            return spawn.createCreep(bt, null, {role: 'worker'});
        }
        else if (spawn.canCreateCreep(mt) == 0) {
            console.log('creating medium worker');
            return spawn.createCreep(mt, null, {role: 'worker'});
        }
        else if (roomAnalyzer.workerCount < 3) {
            console.log('creating small worker');
            return spawn.createCreep(st, null, {role: 'worker'});
        }
    }

    CreepFactory.prototype.spawnTransporter = function spawnTransporter(spawn) {
        var st = [CARRY, MOVE, CARRY, MOVE];
        var mt = [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE];
        var bt = [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE];
        var roomAnalyzer = RoomAnalyzer.getRoomAnalyzer(spawn.room);
        if (roomAnalyzer.extensionCount >= 10 && spawn.canCreateCreep(bt) == 0) {
            return spawn.createCreep(bt, null, {role: 'transporter'});
        }
        else if (roomAnalyzer.extensionCount >= 5 && spawn.canCreateCreep(mt) == 0) {
            return spawn.createCreep(mt, null, {role: 'transporter'});
        }
        else {
            return spawn.createCreep(st, null, {role: 'transporter'});
        }

    }

    CreepFactory.prototype.spawnBuilder = function spawnBuilder(spawn) {
        var roomAnalyzer = RoomAnalyzer.getRoomAnalyzer(spawn.room);
        var ebt = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, WORK, CARRY, WORK, CARRY, MOVE];
        var bt = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, WORK, CARRY, MOVE];
        var mt = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
        var st = [WORK, CARRY, MOVE];
        if (roomAnalyzer.extensionCount >= 20 && spawn.canCreateCreep(ebt) == 0) {
            return spawn.createCreep(ebt, null, {role: 'builder'});
        }
        else if (roomAnalyzer.extensionCount >= 10 && spawn.canCreateCreep(bt) == 0) {
            return spawn.createCreep(bt, null, {role: 'builder'});
        }
        else if (roomAnalyzer.extensionCount >= 5 && spawn.canCreateCreep(mt) == 0) {
            return spawn.createCreep(mt, null, {role: 'builder'});
        }
        else {
            return spawn.createCreep(st, null, {role: 'builder'});
        }
    }

    CreepFactory.prototype.spawnUpgrader = function spawnUpgrader(spawn) {
        var bt = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE]; //700
        var mt = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE]; //500
        var st = [WORK, CARRY, MOVE]; //200
        if (spawn.canCreateCreep(bt) == 0) {
            return spawn.createCreep(bt, null, {role: 'upgrader'});
        }
        if (spawn.canCreateCreep(mt) == 0) {
            return spawn.createCreep(mt, null, {role: 'upgrader'});
        }
        else {
            return spawn.createCreep(st, null, {role: 'upgrader'});
        }

    }

    CreepFactory.prototype.spawnGuard = function spawnGuard(spawn, flagid) {
        var est = [MOVE, ATTACK];
        var mt = [TOUGH, MOVE, ATTACK, ATTACK, ATTACK, MOVE];
        var bt = [TOUGH, TOUGH, TOUGH, MOVE, ATTACK, ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK, MOVE];
        var ebt = [TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK, MOVE];
        if (spawn.canCreateCreep(bt) == 0) {
            return spawn.createCreep(bt, null, {role: 'guard', flag: flagid});
        }
        /*
         else if(spawn.canCreateCreep(mt)==0){
         return spawn.createCreep(mt,null,{role: 'guard', flag: flagid});
         }
         else{
         return spawn.createCreep(est,null,{role: 'guard', flag: flagid});
         }
         */
    }
    
    CreepFactory.prototype.spawnDefender = function spawnDefender(spawn, flagid) {
        var est = [MOVE, RANGED_ATTACK];
        var mt = [MOVE, RANGED_ATTACK, RANGED_ATTACK, MOVE];
        var bt = [RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE];
        var ebt = [RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE,MOVE];
        if (spawn.canCreateCreep(bt) == 0) {
            return spawn.createCreep(bt, null, {role: 'guard', flag: flagid});
        }
    }

    CreepFactory.prototype.spawnScout = function spawnScout(spawn, flagid) {
        var est = [MOVE];
        var mt = [MOVE, MOVE];
        var bt = [MOVE, MOVE, MOVE];
        if (spawn.canCreateCreep(bt) == 0) {
            return spawn.createCreep(bt, null, {role: 'guard', flag: flagid});
        }
        /*
         else if(spawn.canCreateCreep(mt)==0){
         return spawn.createCreep(mt,null,{role: 'guard', flag: flagid});
         }
         else{
         return spawn.createCreep(est,null,{role: 'guard', flag: flagid});
         }
         */
    }

    return CreepFactory;
})();

