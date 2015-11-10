/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('harvester'); // -> 'a thing'
 */
module.exports = function(creep) {
 var TransporterCreep = require("TransporterCreep");
 var transporter = new TransporterCreep(creep);
 transporter.DEBUG = false;

 if (undefined === creep.memory.state) {
  transporter.log('setting state TRANSPORTING');
  creep.memory.state = 'TRANSPORTING'
 }

 if (creep.memory.workerId == undefined || creep.memory.workerId == -1) {
  transporter.log(' no target set, looking...........');
  transporter.setWorker();
 }

 if (creep.carry.energy == creep.carryCapacity && creep.memory.state != 'UPGRADING') {
  transporter.log('state set to DELIVER');
  creep.memory.state = 'DELIVER';
 }

 if ((creep.memory.state == 'DELIVER' || creep.memory.state == 'UPGRADING') && creep.carry.energy == 0) {
  transporter.log('STATE set to transporting');
  creep.memory.state = 'TRANSPORTING';
  creep.memory.structureId = -1;
 }

 var worker = Game.getObjectById(creep.memory.workerId);
 if (!worker) {
  transporter.log('worker died?');
  creep.memory.workerId = -1;
  creep.memory.state = 'TRANSPORTING';
 }

 if (creep.memory.state == 'TRANSPORTING' && worker) {
  if (!creep.pos.isNearTo(worker)) {
   transporter.log('MOVING to worker' + worker.name);
   transporter.moveByMemoryPath(worker.pos);
  }
 }

 if (creep.memory.state == 'DELIVER') {
  if (!creep.memory.structureId || creep.memory.structureId == -1) {
   var taker = transporter.findTaker();
   if (taker) {
    transporter.log('Found taker ' + JSON.stringify(taker));
    creep.memory.structureId = taker.id;
   }
  }

  if (creep.memory.structureId && creep.memory.structureId != -1) {
   var structure = Game.getObjectById(creep.memory.structureId);
   if (structure && ((structure.energy < structure.energyCapacity) || (structure.store && structure.store.energy < structure.storeCapacity) || (structure.carry && structure.carry.energy < structure.carryCapacity))) {
    if (creep.pos.isNearTo(structure)) {
     creep.transferEnergy(structure);
    }
    else {
     transporter.moveByMemoryPath(structure.pos);
    }
   }
   else {
    creep.memory.structureId = -1;
   }
  }
 }

 //creep.pos.createConstructionSite(STRUCTURE_ROAD);
};
