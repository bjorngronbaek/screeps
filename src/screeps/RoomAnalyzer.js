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
        this.analysedEnergy = false;
        this.isAnalyzedFriendlies = false;

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
            friendlies: {
                creeps: {
                    workers: [],
                    transporters: [],
                    upgraders: [],
                    builders: [],
                    guards: []
                },
                structures: {
                    spawns: [],
                    extensions: [],
                    links: [],
                    stores: []
                }
            },
            energy: {
                givers: {
                    sources: [],
                    workers: [],
                    spawns: [],
                    stores: [],
                    extensions: [],
                    all: []
                },
                takers: {
                    upgraders: [],
                    spawns: [],
                    stores: [],
                    extensions: [],
                    all: []
                }
            }
        };
    }
    
    RoomAnalyzer.prototype.log = function(message){
        console.log('[Analyzer]: '+message);
    }
    
    RoomAnalyzer.prototype.analyzeFriendlies = function(){
        if(!this.isAnalyzedFriendlies){
            this.log("analysing friendlies");
            this.isAnalyzedFriendlies = true;
            
            this.result.friendlies.creeps.workers = this.room.find(FIND_MY_CREEPS, {
                filter: function(c){ return c.memory.role == 'worker'; }
            });
            this.result.friendlies.creeps.transporters = this.room.find(FIND_MY_CREEPS, {
                filter: function(c){ return c.memory.role == 'transporter'; }
            });
            this.result.friendlies.creeps.upgraders = this.room.find(FIND_MY_CREEPS, {
                filter: function(c){ return c.memory.role == 'upgrader'; }
            });
            this.result.friendlies.creeps.builders = this.room.find(FIND_MY_CREEPS, {
                filter: function(c){ return c.memory.role == 'builder'; }
            });
            this.result.friendlies.creeps.guards = this.room.find(FIND_MY_CREEPS, {
                filter: function(c){ return c.memory.role == 'guards'; }
            });
            
            
            this.result.friendlies.structures.spawns = this.room.find(FIND_MY_SPAWNS);
            this.result.friendlies.structures.extensions = this.room.find(FIND_MY_STRUCTURES, {
                filter: function(s) {return s.structureType == STRUCTURE_EXTENSION}
            });
            this.result.friendlies.structures.stores = this.room.find(FIND_MY_STRUCTURES, {
                filter: function(s) {return s.structureType == STRUCTURE_STORAGE}
            });
            this.result.friendlies.structures.links = this.room.find(FIND_MY_STRUCTURES, {
                filter: function(s) {return s.structureType == STRUCTURE_LINK}
            });

            
        }
        return this.result;
    }
    
    RoomAnalyzer.prototype.analyzeEnergy = function(){
        if(!this.analysedEnergy){
            this.log("analysing energy");

            /* find the energy givers in the room */
            this.result.energy.givers.sources = this.room.find(FIND_SOURCES);
            this.result.energy.givers.workers = this.room.find(FIND_MY_CREEPS, {
                filter : function(c) {return c.memory.role == 'worker' && c.carry.energy > 0}
            });
            this.result.energy.givers.spawns = this.room.find(FIND_MY_STRUCTURES, {
                filter : function(s) {return s.energy > 0 && s.structureType == STRUCTURE_SPAWN}
            });
            this.result.energy.givers.stores = this.room.find(FIND_MY_STRUCTURES, {
                filter : function(s) {return s.energy > 0 && s.structureType == STRUCTURE_STORAGE}
            });
            this.result.energy.givers.extensions = this.room.find(FIND_MY_STRUCTURES, {
                filter: function(s) {return s.energy > 0 && s.structureType == STRUCTURE_EXTENSION}
            });
            
            /* find the energy takers in the room */
            this.result.energy.takers.extensions = this.room.find(FIND_MY_STRUCTURES, {
                filter: function(s) {return s.energy < s.energyCapacity && s.structureType == STRUCTURE_EXTENSION}
            });
            this.result.energy.takers.spawns = this.room.find(FIND_MY_STRUCTURES, {
                filter: function(s) {return s.energy < s.energyCapacity && s.structureType == STRUCTURE_SPAWN}
            });
            this.result.energy.takers.stores = this.room.find(FIND_MY_STRUCTURES, {
                filter: function(s) {return s.structureType == STRUCTURE_STORAGE && s.store.energy < s.storeCapacity}
            });
            this.result.energy.takers.upgraders = this.room.find(FIND_MY_CREEPS, {
                filter: function(c) {return c.carry.energy < c.carryCapacity / 2 && c.memory.role == 'upgrader'}
            });
            
            console.log(JSON.stringify(this.result));
            this.analysedEnergy = true;
        }
        
        return this.result;
    };

    RoomAnalyzer.prototype.analyzeHostiles = function analyzeHostiles() {
        if (!this.isAnalyzedHostiles) {
            this.log("analysing hostiles");
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
            this.log("analysing OLD");
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
            });
            if (guards) this.guardCount = guards.length;

            var builders = this.room.find(FIND_MY_CREEPS, {
                filter: function (creep) {
                    return creep.memory.role == 'builder';
                }
            });
            if (builders) this.builderCount = builders.length;

            var upgraders = this.room.find(FIND_MY_CREEPS, {
                filter: function (creep) {
                    return creep.memory.role == 'upgrader';
                }
            });
            if (upgraders) this.upgraderCount = upgraders.length;

            var constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
            if (constructionSites) this.constructionSiteCount = constructionSites.length;

            var storage = this.room.find(FIND_MY_STRUCTURES, {filter: {structureType: 'storage'}})
            if (storage.length) this.storageId = storage[0].id;

            var myStructures = this.repairSites = this.room.find(FIND_MY_STRUCTURES, {
                filter: function (i) {
                    return i.hits < i.hitsMax / 2 && i.hits < 5000000;
                }
            });
            this.repairSites = myStructures;
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
    
    RoomAnalyzer.prototype.dispose = function dispose() {
        this.analyzis = 0;
        this.room = this.result = null;
        delete RoomAnalyzer.rooms[this.roomName];
    };

    RoomAnalyzer.disposeAll = function disposeAll() {
        Object.keys(RoomAnalyzer.rooms).forEach(function (key) {
            RoomAnalyzer.rooms[key].dispose();
        });
    };

    return RoomAnalyzer;
})();
