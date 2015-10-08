var BaseCreep = require("BaseCreep");

var TransporterCreep = function(creep) {
    BaseCreep.apply(this, arguments);
};

TransporterCreep.prototype = Object.create(BaseCreep.prototype);
TransporterCreep.prototype.constructor = TransporterCreep;

module.exports = TransporterCreep;

TransporterCreep.prototype.setWorker = function() {
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
        that.log('found ' + transportersForWorker + ' for ' + worker);
        
        /* if there's fewer than two transporters assigned, then assign this transporter */
        if (!transportersForWorker.length || transportersForWorker.length < 2) {
            that.log('assigning ' + that.name + ' to worker ' + worker.name);
            that.memoryProp.workerId = worker.id;
        }
        else {
            /* do nothing */
            that.log('found max transporters for worker ' + worker.name);
        }
    });
}

TransporterCreep.prototype.findTaker = function() {
    var result = this.roomAnalyzer.analyzeEnergy();
    if(result.energy.takers.spawns.length > 0){
        return this.creep.room.findClosestByPath(result.energy.takers.spawns);
    }
    if(result.energy.takers.extensions.length > 0){
        return this.creep.room.findClosestByPath(result.energy.takers.extensions);
    }
    if(result.energy.takers.upgraders.length > 0){
        return this.creep.room.findClosestByPath(result.energy.takers.upgraders);
    }
    if(result.energy.takers.stores.length > 0){
        return this.creep.room.findClosestByPath(result.energy.takers.stores);
    }
}