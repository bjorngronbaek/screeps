/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('CreepUtils'); // -> 'a thing'
 */
 
 module.exports = function (){
 
 function log(creep,message,options){
 if(options.debug){
 _log(creep,message);
 }
 else{
 //nodebug
 }
 }
 
 function _log(creep,message){
 console.log('['+creep.role+'] '+creep.name+': '+message);
 }
 };
