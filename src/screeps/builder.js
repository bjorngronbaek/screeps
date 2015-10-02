/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('builder'); // -> 'a thing'
 */

module.exports = function (creep) {

    function moveToFlag() {
        var flag = Game.getObjectById(creep.memory.flag);
        if (flag) {
            if (creep.memory.path === undefined) {
                var exitDir = creep.room.findExitTo(flag.room);
                var exit = creep.pos.findClosestByPath(exitDir);
                creep.memory.path = creep.pos.findPathTo(exit)
            }
            else {
                creep.move(creep.memory.path.shift());
            }
            //creep.moveTo(exit);
            log(creep, 'moving to ' + flag.room + ' from ' + creep.room);

            if (creep.room == flag.room) {
                log(creep, 'is arrived');
                creep.memory.flag = -1;
            }
        }
    }

    var Builder = require("BuilderCreep");
    var builder = new Builder(creep);
    if (creep.memory.flag != undefined && creep.memory.flag != -1) {
        moveToFlag();
    }
    else {
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
                log(creep, ' moving to site ' + site + ' by path :' + JSON.stringify(creep.memory.path))
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
};

