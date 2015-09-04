/* nothing */ var harvester = require('harvester');
var builder = require('builder');
var guard = require('guard');
var spawner = require('spawner');
var transporter = require('transporter');
var upgrader = require('upgrader');
var RoomAnalyzer = require('RoomAnalyzer');

Memory.scoutRooms = ['E9N3','E9N5'];

for(var name in Game.spawns){
 var spawn = Game.spawns[name];
 spawner(spawn);
}

for (var name in Game.creeps){
 var creep = Game.creeps[name];
 
 if(creep.memory.role == 'worker'){
 harvester(creep);
 }
 if(creep.memory.role == 'builder'){
 builder(creep);
 }
 if(creep.memory.role == 'transporter'){
 transporter(creep);
 }
 if(creep.memory.role == 'guard'){
 guard(creep);
 }
 if(creep.memory.role == 'upgrader'){
 upgrader(creep);
 }
}

function setFlag(role,flagid){
 for(var name in Game.creeps){
 var c = Game.creeps[name];
 if(c.memory.role == role){
 c.memory.flag = flagid;
 c.memory.exit = undefined;
 }
 }
}

function moveTo(role,pos){
 for(var name in Game.creeps){
 var c = Game.creeps[name];
 if(c.memory.role == role && c.pos != pos){
 c.moveTo(pos);
 }
 
 }
}

//setFlag('builder','55c34a6b5be41a0a6e80bd80')
//setFlag('guard','55c34a6b5be41a0a6e80bd80') //guards to e9n5
//moveTo('guard',Game.flags.Flag1.pos) //guards to e9n5


/*
var CreepFactory = require('CreepFactory')
var factory = new CreepFactory();
var roomAnalyzerE9N5 = RoomAnalyzer.getRoomAnalyzer(Game.rooms.E9N5);
var assignedGuards = Game.spawns.Spawn1.room.find(FIND_MY_CREEPS,{filter: function(c){
 return c.memory.flag == '55c34a6b5be41a0a6e80bd80';
}})
if(roomAnalyzerE9N5.guardCount < 2 && (!assignedGuards || assignedGuards.length < 3)){
 factory.spawnGuard(Game.spawns.Spawn1,'55c34a6b5be41a0a6e80bd80');
 //console.log('SPAWING FOR E95N '+roomAnalyzerE9N5.guardCount+' '+assignedGuards);
}
*/
/*
var roomAnalyzerE9N6 = RoomAnalyzer.getRoomAnalyzer(Game.rooms.E9N6);
if(roomAnalyzerE9N6.hostileCount > roomAnalyzerE9N6.guardCount || roomAnalyzerE9N6.guardCount < 2){
 var CreepFactory = require('CreepFactory')
 var factory = new CreepFactory();
 factory.spawnGuard(Game.spawns.Spawn1,'55c34a6b5be41a0a6e80bdfa');
}
*/
/*
var roomAnalyzerE8N5 = RoomAnalyzer.getRoomAnalyzer(Game.rooms.E8N5);
if(roomAnalyzerE8N5.hostileCount > roomAnalyzerE8N5.guardCount){
 var CreepFactory = require('CreepFactory')
 var factory = new CreepFactory();
 factory.spawnGuard(Game.spawns.Spawn1,'55c34a6c5be41a0a6e80caff');
}
*/
