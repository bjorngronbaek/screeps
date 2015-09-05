/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('builder'); // -> 'a thing'
 */

module.exports = function (creep) {
    var utils = require('CreepUtils');

    var DEBUG = 0;

    function log(creep, message) {
        //utils.log(creep,message,{debug:true});
        if (DEBUG) {
            console.log('[BUILDER] ' + creep.name + ': ' + message);
        }
    }

    function findEnergy(creep) {
        var RoomAnalyzer = require('RoomAnalyzer');
        var roomAnalyzer = RoomAnalyzer.getRoomAnalyzer(creep.room);
        if (creep.memory.structureId === undefined || creep.memory.structureId == -1) {
            var storage = Game.getObjectById(roomAnalyzer.storageId);
            if (storage) {
                /* search for storage */
                creep.memory.structureId = storage.id;
            }
            else {
                /* search for structures */
                var structure = creep.pos.findClosest(FIND_MY_STRUCTURES, {
                    filter: function (s) {
                        if (s.energy && s.energy > 0) {
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
                else {
                    creep.memory.flag = Game.spawns.Spawn1.id;
                }
            }
        }
    }

    function findSite(creep) {
        var RoomAnalyzer = require('RoomAnalyzer');
        var roomAnalyzer = RoomAnalyzer.getRoomAnalyzer(creep.room);
        if (creep.memory.siteId === undefined || creep.memory.siteId == -1) {
            log(creep, ' finding site. c=' + roomAnalyzer.constructionSiteCount + ' r=' + roomAnalyzer.repairSiteCount)

            var spawn2con = Game.getObjectById('55de2224d5d7a42f584d0b72');
            if (spawn2con && RoomAnalyzer.getRoomAnalyzer(spawn2con.room).hostileCount == 0) {
                creep.memory.siteId = spawn2con.id;
            }
            else if (roomAnalyzer.constructionSiteCount > 0) {
                var site = creep.pos.findClosest(FIND_CONSTRUCTION_SITES);
                if (site) creep.memory.siteId = site.id;
            }
            else if (roomAnalyzer.repairSiteCount) {
                var site = roomAnalyzer.repairSites.shift();
                if (site) {
                    creep.memory.siteId = site.id;
                }
            }
            else {
                var site = creep.pos.findClosest(FIND_MY_STRUCTURES);
                creep.memory.siteId = site.id;
            }
        }
    }

    function moveToFlag() {
        var flag = Game.getObjectById(creep.memory.flag);
        if (flag) {
            if (creep.memory.path === undefined) {
                var exitDir = creep.room.findExitTo(flag.room);
                var exit = creep.pos.findClosest(exitDir);
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

    if (creep.memory.flag != undefined && creep.memory.flag != -1) {
        moveToFlag();
    }
    else {
        if (creep.carry.energy == 0) {
            log(creep, 'finding energy')
            /* get rid of site and find structure for more energy */
            creep.memory.siteId = -1;
            findEnergy(creep);

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
            findSite(creep);
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
