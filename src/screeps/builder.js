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
            builder.log('finding energy')
                /* get rid of site and find structure for more energy */
            creep.memory.siteId = -1;
            builder.findEnergy();

            var structure = Game.getObjectById(creep.memory.structureId);
            if (structure) {
                if (creep.memory.path === undefined || creep.memory.path == -1) {
                    creep.memory.path = creep.pos.findPathTo(structure);
                }
                if (creep.pos.isNearTo(structure)) {
                    structure.transferEnergy(creep);
                }
                else {
                    creep.moveTo(structure);
                }
                if (structure.energy == 0) {
                    creep.memory.structureId = -1;
                    creep.memory.path = -1;
                }
            }
            else {
                creep.memory.flag = Game.spawns.Spawn1;
            }
        }
        else {
            builder.findSite();
            var site = Game.getObjectById(creep.memory.siteId);
            if (site) {
                if (creep.memory.path === undefined || creep.memory.path == -1 || creep.memory.path.lenght == 0) {
                    creep.memory.path = creep.pos.findPathTo(site);
                }
                builder.log(creep, ' moving to site ' + site + ' by path :' + JSON.stringify(creep.memory.path))
                creep.pos.createConstructionSite(STRUCTURE_ROAD);
                if (creep.pos.isNearTo(site)) {
                    creep.build(site);
                    creep.repair(site);
                    creep.transferEnergy(site);
                }
                else {
                    creep.moveTo(site);
                    //creep.moveByPath(creep.memory.path);
                    //creep.memory.path.shift();
                }
            }
            else {
                console.log('NO site ' + creep);
                creep.memory.siteId = -1;
                creep.memory.path = -1;
            }
        }
    }

    var Builder = require("BuilderCreep");
    var builder = new Builder(creep);

    if (creep.room.controller.my === true) {
        builder.log("it my room!")
        //operate(creep,builder);
    }
    else {
        builder.log("Not my room!")
        if (!creep.pos.isNearTo(creep.room.controller)) {
            creep.memory.targetRoomPosition = creep.room.controller;
            builder.moveToTarget();
        }
        else {
            creep.claimController(creep.room.controller);
        }
    }

};
