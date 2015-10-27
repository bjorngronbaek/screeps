var BaseCreep = require("BaseCreep");

var TransporterCreep = function(creep) {
    BaseCreep.apply(this, arguments);
    this.DEBUG = true;
};

TransporterCreep.prototype = Object.create(BaseCreep.prototype);
TransporterCreep.prototype.constructor = TransporterCreep;

module.exports = TransporterCreep;

TransporterCreep.prototype.setWorker = function() {
    this.log("Setting worker");
    var that = this;
    /* find all the workers in this room */
    var workers = this.creep.room.find(FIND_MY_CREEPS, {
        filter: function(c) {
            return c.memory.role == 'worker';
        }
    });
    this.log('found workers' + workers);

    /* for each worker, check if correct number of transporters are assigned */
    workers.forEach(function(worker) {
        /* find all transporters in the room that is assigned to the worker*/
        var transportersForWorker = worker.room.find(FIND_MY_CREEPS, {
            filter: function(w) {
                return w.memory.role == 'transporter' && worker.id == w.memory.workerId;
            }
        });
        //that.log('found ' + transportersForWorker + ' for ' + worker);

        /* if there's fewer than two transporters assigned, then assign this transporter */
        if (!transportersForWorker.length || transportersForWorker.length < 2) {
            that.log('assigning ' + that.name + ' to worker ' + worker.name);
            that.memoryProp.workerId = worker.id;
        }
        else {
            /* do nothing */
            //that.log('found max transporters for worker ' + worker.name);
        }
    });
}

TransporterCreep.prototype.findTaker = function() {
    var result = this.roomAnalyzer.analyzeEnergy();
    if (result.energy.takers.spawns.length > 0) {
        return this.creep.pos.findClosestByPath(result.energy.takers.spawns);
    }
    if (result.energy.takers.extensions.length > 0) {
        return this.creep.pos.findClosestByPath(result.energy.takers.extensions);
    }
    if (result.energy.takers.upgraders.length > 0) {
        return this.creep.pos.findClosestByPath(result.energy.takers.upgraders);
    }
    if (result.energy.takers.stores.length > 0) {
        return this.creep.pos.findClosestByPath(result.energy.takers.stores);
    }
};

TransporterCreep.prototype.findGiver = function() {
    var result = this.roomAnalyzer.analyzeEnergy();
    if (result.energy.takers.spawns.length > 0) {
        return this.creep.pos.findClosestByPath(result.energy.takers.spawns);
    }
    if (result.energy.takers.extensions.length > 0) {
        return this.creep.pos.findClosestByPath(result.energy.takers.extensions);
    }
    if (result.energy.takers.upgraders.length > 0) {
        return this.creep.pos.findClosestByPath(result.energy.takers.upgraders);
    }
    if (result.energy.takers.stores.length > 0) {
        return this.creep.pos.findClosestByPath(result.energy.takers.stores);
    }
};

TransporterCreep.prototype.apply = function() {
    if (this.creep.carry.energy > 0) {
        this.log('Have energy!')
        if (this.memoryProp.takerId) {
            var taker = Game.getObjectById(this.memoryProp.takerId);
            
            if (requiresEnergy(taker)) {
                this.log('Moving to taker ' + taker.pos);
                if (this.creep.pos.isNearTo(taker)) {
                    this.creep.transferEnergy(taker);
                }
                else {
                    this.moveByMemoryPath(taker.pos);
                }
            }
            else {
                this.log('Taker is no longer requiring energy ');
                var newTaker = this.findTaker();
                if (newTaker) {
                    this.log('Found taker ' + newTaker.pos)
                    this.memoryProp.takerId = newTaker.id;
                    this.memoryProp.path = null;
                }
            }
        }
        else {
            this.log('Finding a new taker.')
            var newTaker = this.findTaker();
            this.log('Takers: '+newTaker);
            if (newTaker) {
                this.log('Found taker ' + newTaker.pos)
                this.memoryProp.takerId = newTaker.id;
                this.memoryProp.path = null;
            }
        }
    }
    else {
        /* are we assigned to a worker? */
        if (this.memoryProp.workerId) {
            var worker = Game.getObjectById(this.memoryProp.workerId);
            /* is the worker alive? */
            if (worker) {
                if (!this.creep.pos.isNearTo(worker)) {
                    this.moveByMemoryPath(worker.pos);
                }
            }
            else {
                this.memoryProp.workerId = null;
            }
        }
        else {
            this.setWorker();
        }
    }
};

function requiresEnergy(structure) {
    if (!structure){
        return false;
    }
    
    console.log("Checking energy requirements for type "+structure.structureType);
    switch (structure.structureType) {
        case STRUCTURE_EXTENSION:
            return structure.energy < structure.energyCapacity;
            break;
        case STRUCTURE_SPAWN:
            return structure.energy < structure.energyCapacity;
            break;  
        case STRUCTURE_STORAGE:
            return structure.store < structure.storeCapacity;
            break
        default:
            return false;
    }
}