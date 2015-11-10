/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('harvester'); // -> 'a thing'
 */
module.exports = function (creep) {
    var BaseCreep = require("BaseCreep");
    var harvester = new BaseCreep(creep);
    
    var RoomAnalyzer = require("RoomAnalyzer");
    var roomAnalyzer = RoomAnalyzer.getRoomAnalyzer(creep.room);
    
    harvester.DEBUG = false;
    
    if(!creep.memory.targetSourceId){
        harvester.log("Searching for source");
        var result = roomAnalyzer.analyzeEnergy();
        var sources = result.energy.givers.sources;
        var source = creep.pos.findClosestByPath(sources);
        if(source){
            creep.memory.targetSourceId = source.id;
        }
    }
    else{
        var source = Game.getObjectById(creep.memory.targetSourceId);
        if(creep.pos.isNearTo(source)){
            if(creep.carry.energy < creep.carryCapacity){
                //harvester.log("Harvesting");
                creep.harvest(source);
            }
            else{
                harvester.log("Full, waiting for transport!");
            }
        }
        else{
            harvester.log("Moving to source "+JSON.stringify(source.pos));
            harvester.moveByMemoryPath(source.pos);
        }
    }
    
    if (creep.carry.energy > creep.carryCapacity / 2) {
        var transporters = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
            filter: function (t) {
                //return t.memory.role == 'transporter' && t.memory.workerId == creep.id;
                return t.memory.role == 'transporter';
            }
        });
        if (transporters.length) {
            harvester.log("Transfering energy to "+transporters[0].name);
            creep.transferEnergy(transporters[0]);
        }
    }
    
    var energies = creep.pos.lookFor('energy');
    harvester.log("Searched for energy, found "+JSON.stringify(energies));
    if(energies.length){
        harvester.log("Picking up energy "+JSON.stringify(energies[0]));
        creep.pickup(energies[0]);
    }
    
};

