/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('harvester'); // -> 'a thing'
 */
module.exports = function (spawn) {
    var _ = require('lodash');
    var CreepFactory = require('CreepFactory')
    var RoomAnalyzer = require('RoomAnalyzer');

    var factory = new CreepFactory();
    var analyzer = RoomAnalyzer.getRoomAnalyzer(spawn.room);

    var expectedWorkerCount = analyzer.workerCount * 2;
    if (spawn.room.name == 'E9N5') {
        expectedWorkerCount = 3;
    }
    if (analyzer.hostileCount != 0 && analyzer.hostileCount > analyzer.guardCount && analyzer.workerCount > 0) {
        factory.spawnDefender(spawn);
    }
    else if (analyzer.transporterCount < expectedWorkerCount) {
        factory.spawnTransporter(spawn);
    }
    else if (analyzer.workerCount < analyzer.sourceCount * 2) {
        //console.log('To few workers, spawning a new one');
        factory.spawnWorker(spawn);
    }
    else if ((analyzer.constructionSiteCount > 0 || analyzer.repairSiteCount > 0) && analyzer.builderCount < 3 && analyzer.workerCount > 1) {
        console.log("must build builder");
        factory.spawnBuilder(spawn);
    }
    else if (analyzer.upgraderCount < 1 && analyzer.workerCount > 1) {
        console.log("must build upgrader");
        if (analyzer.constructionSiteCount > 5 && analyzer.upgraderCount > 1) {
            //build nothing
        }
        else {
            factory.spawnUpgrader(spawn);
        }
    }
};

