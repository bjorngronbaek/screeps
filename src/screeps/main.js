/* $date: $ */
/* test1 1*/
var harvester = require('harvester');
var builder = require('builder');
var guard = require('guard');
var spawner = require('spawner');
var upgrader = require('upgrader');
var TransporterCreep = require("TransporterCreep");
var RoomAnalyzer = require("RoomAnalyzer");

module.exports.loop = function() {
    
    console.log('---------------- MAIN LOOP ----------------');

    for (var name in Game.spawns) {
        var spawn = Game.spawns[name];
        spawner(spawn);
    }

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];

        if (creep.memory.role == 'worker') {
            harvester(creep);
        }
        if (creep.memory.role == 'builder') {
            builder(creep);
        }
        if (creep.memory.role == 'transporter') {
            var transporter = new TransporterCreep(creep);
            transporter.apply()
            //transporter(creep);
        }
        if (creep.memory.role == 'guard') {
            guard(creep);
        }
        if (creep.memory.role == 'upgrader') {
            upgrader(creep);
        }
    }
    
    RoomAnalyzer.disposeAll();
      
}

function setFlag(role, flag) {
    for (var name in Game.creeps) {
        var c = Game.creeps[name];
        if (c.memory.role == role) {
            c.memory.targetRoomPosition = flag;
        }
    }
}

//setFlag('builder','55c34a6b5be41a0a6e80bd80')
//setFlag('guard','Game.flags.FlagE9N5') //guards to e9n5
//moveTo('guard',Game.flags.Flag1.pos) //guards to e9n5
