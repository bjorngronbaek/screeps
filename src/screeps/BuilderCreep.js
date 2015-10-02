var BaseCreep = require("BaseCreep");

var BuilderCreep = function(creep){
    BaseCreep.apply(this,arguments);
};

BuilderCreep.prototype = Object.create(BaseCreep.prototype);
BuilderCreep.prototype.constructor = BuilderCreep;

module.exports = BuilderCreep;

BuilderCreep.prototype.findEnergy = function() {
    var RoomAnalyzer = require('RoomAnalyzer');
    var roomAnalyzer = RoomAnalyzer.getRoomAnalyzer(this.creep.room);
    if (!this.memoryProp.structureId) {
        var storage = Game.getObjectById(roomAnalyzer.storageId);
        if (storage) {
            /* search for storage */
            this.memoryProp.structureId = storage.id;
        }
        else {
            /* search for structures */
            var structure = this.creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
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
                this.memoryProp.structureId = structure.id;
            }

        }
    }
}

BuilderCreep.prototype.findSite = function () {
    var RoomAnalyzer = require('RoomAnalyzer');
    var roomAnalyzer = RoomAnalyzer.getRoomAnalyzer(this.creep.room);
    if (!this.memoryProp.siteId) {
        this.log('finding site. c=' + roomAnalyzer.constructionSiteCount + ' r=' + roomAnalyzer.repairSiteCount)

        var site;
        if (roomAnalyzer.constructionSiteCount > 0) {
            site = this.creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        }
        else if (roomAnalyzer.repairSiteCount) {
            site = roomAnalyzer.repairSites.shift();
        }
        else {
            site = this.creep.pos.findClosestByPath(FIND_MY_STRUCTURES);
        }

        if (site){
            this.memoryProp.siteId = site.id;
        }
    }
}