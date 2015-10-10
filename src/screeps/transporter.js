/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('harvester'); // -> 'a thing'
 */
module.exports = function(creep) {
 var RoomAnalyzer = require('RoomAnalyzer');
 var roomAnalyzer = RoomAnalyzer.getRoomAnalyzer(creep.room);
 var DEBUG = 0;

 function log(creep, message) {
  if (DEBUG) {
   console.log('[TRANSPORTER] ' + creep.name + ': ' + message)
  }
 }

 function setPath(target) {
  var path = creep.pos.findPathTo(target, {
   maxOps: 200
  });
  if (!path.length /* || !target.equalsTo(path[path.length - 1]) */ ) {
   path = creep.pos.findPathTo(target, {
    maxOps: 1000,
    ignoreDestructibleStructures: true
   });
  }
  creep.memory.path = path
 }

 function setStructure(creep) {
  if (roomAnalyzer.emptyExtensionCount > 0 || roomAnalyzer.emptySpawnCount > 0) {
   var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
    filter: function(s) {
     if (s.energy < s.energyCapacity) {
      return true;
     }
     else {
      return false;
     }
    }
   });
   if (structure) {
    creep.memory.structureId = structure.id;
   }
  }
  else {
   if (roomAnalyzer.storageId != undefined) {
    var s = Game.getObjectById(roomAnalyzer.storageId);
    if (s.store.energy < s.storeCapacity) {
     creep.memory.structureId = s.id;
    }
    else {
     creep.memory.structureId = -1;
    }
   }
   else {
    creep.memory.structureId = -1;
   }
  }
 }

 function setWorker() {
  var workers = creep.room.find(FIND_MY_CREEPS, {
   filter: function(creep) {
    return creep.memory.role == 'worker';
   }
  });
  log(creep, 'found workers' + workers);
  workers.forEach(function(worker) {
   var transportersForWorker = worker.room.find(FIND_MY_CREEPS, {
    filter: function(w) {
     return w.memory.role == 'transporter' && worker.id == w.memory.workerId;
    }
   });
   log(creep, 'found ' + transportersForWorker + ' for ' + worker);
   if (!transportersForWorker.length || transportersForWorker.length < 2) {
    log(creep, 'assigning ' + creep.name + ' to worker ' + worker.name);
    creep.memory.workerId = worker.id;
   }
   else {
    log(creep, 'found max transporters for worker ' + worker.name);
   }
  });
 }

 var TransporterCreep = require("TransporterCreep");
 var transporter = new TransporterCreep(creep);

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
   transporter.log('MOVING to worker' +worker.name);
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
   if (structure) {
    if (
     (structure.energy < structure.energyCapacity) 
     || (structure.store && structure.store.energy < structure.storeCapacity)
     || (structure.carry && structure.carry.energy < structure.carryCapacity)
     ) {
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
 }

 //creep.pos.createConstructionSite(STRUCTURE_ROAD);
};
