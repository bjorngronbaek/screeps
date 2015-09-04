/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('harvester'); // -> 'a thing'
 */
module.exports = function(creep){
 function log(creep,message){
 //console.log('[HARVESTER] '+creep+': '+message);
 }
 
 
 function moveToTargetByPath(target,targetDistance){
 if(creep.memory.path && creep.memory.path.length){
 var path = creep.memory.path;
 log(creep,'path='+JSON.stringify(path));
 creep.move(path.shift().direction);
 }
 else{
 if(target){
 if(!creep.pos.inRangeTo(target,targetDistance)){
 creep.memory.path = creep.pos.findPathTo(target);
 }
 else{
 //log(creep,'already in range');
 }
 }
 }
 }
 
 var source = creep.pos.findClosest(FIND_SOURCES);
 moveToTargetByPath(source,1);

 if(creep.carry.energy > creep.carryCapacity / 2){
 var transporters = creep.pos.findInRange(FIND_MY_CREEPS,1,{filter: function(t){
 return t.memory.role == 'transporter' && t.memory.workerId == creep.id;
 }});
 if(transporters.length){
 creep.transferEnergy(transporters[0]);
 }
 else{
 creep.harvest(source);
 }
 }
 else{
 creep.harvest(source);
 }
};
