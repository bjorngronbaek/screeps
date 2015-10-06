/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('builder'); // -> 'a thing'
 */

module.exports = function(creep) {

    function operate(creep, builder) {
        if (creep.carry.energy == 0) {
            builder.log('finding energy');
            
            /* get rid of site and find structure for more energy */
            creep.memory.siteId = -1;
            builder.findEnergy();

            var structure = Game.getObjectById(creep.memory.structureId);
            if (structure) {
                if (creep.pos.isNearTo(structure)) {
                    structure.transferEnergy(creep);
                }
                else {
                    builder.moveByMemoryPath(structure.pos)
                    //creep.moveTo(structure);
                }
                if (structure.energy == 0) {
                    creep.memory.structureId = null;
                }
            }

        }
        else {
            builder.findSite();
            var site = Game.getObjectById(creep.memory.siteId);
            if (site) {
                creep.pos.createConstructionSite(STRUCTURE_ROAD);
                if (creep.pos.isNearTo(site)) {
                    creep.build(site);
                    creep.repair(site);
                    creep.transferEnergy(site);
                }
                else {
                    builder.moveByMemoryPath(site.pos);
                }
            }
            else {
                builder.log('NO site');
                creep.memory.siteId = null;
            }
        }
    }

    var Builder = require("BuilderCreep");
    var builder = new Builder(creep);

    if (creep.room.controller.my === true) {
        operate(creep,builder);
    }
    else {
        builder.log("Not my room!");
        if (!creep.pos.isNearTo(creep.room.controller)) {
            creep.memory.targetRoomPosition = creep.room.controller;
            builder.moveToTarget();
        }
        else {
            creep.claimController(creep.room.controller);
        }
    }

};
