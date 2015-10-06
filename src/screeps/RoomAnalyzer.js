/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('RoomAnalyzer'); // -> 'a thing'
 */

module.exports = (function () {
    'use strict';

    function RoomAnalyzer(roomName) {
        this.roomName = roomName;
        this.room = Game.rooms[roomName];
        this.analyzed = 0;
        this.isAnalyzedHostiles = false;
        this.isAnalyzedWalls = false;
        this.isAnalyzedControllers = false;

        /* creep types */
        this.workerCount = 0;
        this.transporterCount = 0;
        this.guardCount = 0;
        this.builderCount = 0;
        this.upgraderCount = 0

        /* enemies */
        this.hostileCount = 0;

        /* energy */
        this.extensionCount = 0;
        this.emptyExtensionCount = 0;
        this.emptySpawnCount = 0;
        this.spawnCount = 0;
        this.sourceCount = 0;
        this.controllerCount = 0;

        /* construction */
        this.costructionSiteCount = 0;
        this.repairSiteCount = 0;
        this.repairSites = [];

        this.storageId;

        this.result = {
            hostiles: {
                creeps: {
                    attackers: [],
                    all: [],
                    count: 0
                },
                structures: {
                    notRamparts: [],
                    all: [],
                    count: 0
                }
            },
            structures: {
                all: []
            },
            controllers: {
                
            }
        };
    }

    RoomAnalyzer.prototype.analyzeHostiles = function analyzeHostiles() {
        if (!this.isAnalyzedHostiles) {
            this.result.hostiles.creeps.attackers = this.room.find(FIND_HOSTILE_CREEPS,
                {
                    filter: function (c) {
                        return c.getActiveBodyparts(ATTACK) != 0 || c.getActiveBodyparts(RANGED_ATTACK) != 0;
                    }
                }
            );
            this.result.hostiles.creeps.all = this.room.find(FIND_HOSTILE_CREEPS);
            this.result.hostiles.creeps.count = this.result.hostiles.creeps.all.length;

            this.result.hostiles.structures.all = this.room.find(FIND_HOSTILE_STRUCTURES);
            this.result.hostiles.structures.notRamparts = this.room.find(FIND_HOSTILE_STRUCTURES,
                {
                    filter: function (s) {
                        return s.structureType != STRUCTURE_RAMPART && s.tructureType != STRUCTURE_CONTROLLER;
                    }
                }
            );
            this.result.hostiles.structures.count = this.result.hostiles.structures.all.length;

            this.isAnalyzedHostiles = true;
        }
    }
    
    RoomAnalyzer.prototype.analyzeControllers = function analyzeControllers() {
        if(!this.isAnalyzedControllers){
            
            this.isAnalyzedControllers = true;
        }
    }

    RoomAnalyzer.prototype.analyzeWalls = function analyzeWalls() {
        if (!this.isAnalyzedWalls) {
            this.result.structures.hostileWalls = this.room.find(FIND_STRUCTURES,
                {
                    filter: function (s) {
                        return s.structureType == STRUCTURE_WALL
                    }
                }
            );
        }

        this.isAnalyzedWalls = true;
    }


    RoomAnalyzer.prototype.analyze = function analyze() {
        if (this.analyzed == 0) {
            //console.log('Analyzing room '+this.roomName);
            var workers = this.room.find(FIND_MY_CREEPS, {
                filter: function (creep) {
                    return creep.memory.role == 'worker';
                }
            });
            if (workers.length) this.workerCount = workers.length;

            var transporters = this.room.find(FIND_MY_CREEPS, {
                filter: function (creep) {
                    return creep.memory.role == 'transporter';
                }
            });
            if (transporters.length) this.transporterCount = transporters.length;

            var sources = this.room.find(FIND_SOURCES);
            if (sources.length) this.sourceCount = sources.length;

            var extensions = this.room.find(FIND_MY_STRUCTURES, {
                filter: function (s) {
                    return s.structureType == STRUCTURE_EXTENSION;
                }
            });
            if (extensions.length) {
                this.extensionCount = extensions.length;
                var eCount = 0;
                extensions.forEach(function (extension) {
                    if (extension.energy < extension.energyCapacity) {
                        eCount++;
                    }
                });
            }
            this.emptyExtensionCount = eCount;

            var spawns = this.room.find(FIND_MY_STRUCTURES, {
                filter: function (s) {
                    return s.structureType == STRUCTURE_SPAWN;
                }
            });
            if (spawns.length) {
                this.spawnCount = spawns.length;
                var sCount = 0;
                spawns.forEach(function (spawn) {
                    if (spawn.energy < spawn.energyCapacity) {
                        sCount++;
                    }
                });
            }
            this.emptySpawnCount = sCount;

            var hostiles = this.room.find(FIND_HOSTILE_CREEPS);
            if (hostiles.length) this.hostileCount = hostiles.length;

            var guards = this.room.find(FIND_MY_CREEPS, {
                filter: function (creep) {
                    return creep.memory.role == 'guard';
                }
            })
            if (guards) this.guardCount = guards.length;

            var builders = this.room.find(FIND_MY_CREEPS, {
                filter: function (creep) {
                    return creep.memory.role == 'builder';
                }
            })
            if (builders) this.builderCount = builders.length;

            var upgraders = this.room.find(FIND_MY_CREEPS, {
                filter: function (creep) {
                    return creep.memory.role == 'upgrader';
                }
            })
            if (upgraders) this.upgraderCount = upgraders.length;

            var constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
            if (constructionSites) this.constructionSiteCount = constructionSites.length;

            var storage = this.room.find(FIND_MY_STRUCTURES, {filter: {structureType: 'storage'}})
            if (storage.length) this.storageId = storage[0].id;

            var myStructures = this.repairSites = this.room.find(FIND_MY_STRUCTURES, {
                filter: function (i) {
                    return i.hits < i.hitsMax / 2 && i.hits < 1500000;
                }
            });
            var myWalls = this.room.find(FIND_STRUCTURES, {
                filter: function (struct) {
                    return struct.structureType == STRUCTURE_WALL && struct.hits < 1500000 && struct.hits < struct.hitsMax;
                }
            });
            this.repairSites = myStructures.concat(myWalls);
            this.repairSiteCount = this.repairSites.length;
            this.repairSites.sort(function (a, b) {
                return a.hits - b.hits;
            });

            /*
             this.repairSites.forEach(function(site){
             console.log('[RoomAnalyzer] '+ site.pos+':'+site.hits)
             })
             */


            this.analyzed = 1;
        }
        else {
            //console.log(this.roomName+' already analyzed');
        }
    };


    RoomAnalyzer.rooms = {};
    RoomAnalyzer.getRoomAnalyzer = function getRoomAnalyzer(room) {
        if (room.name) var roomName = room.name;
        if (!RoomAnalyzer.rooms[roomName]) {
            RoomAnalyzer.rooms[roomName] = new RoomAnalyzer(roomName);
        }
        RoomAnalyzer.rooms[roomName].analyze();
        return RoomAnalyzer.rooms[roomName];
    };

    return RoomAnalyzer;
})();

