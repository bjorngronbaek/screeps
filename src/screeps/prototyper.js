/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('prototyper'); // -> 'a thing'
 */
 
module.exports.register = function(){
 var prototypes = Memory.gamestate.proptotypes;
 if(prototypes == 0){
 console.log('registering prototypes');
 
 Structure.prototype.needsRepair = function(name) {
 return this.hits < this.hitsMax / 2;
 };
 
 Memory.gamestate = {prototypes: false};
 
 }
};
