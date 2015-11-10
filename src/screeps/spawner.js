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
    var DEBUG = false;

    var factory = new CreepFactory();
    var analyzer = RoomAnalyzer.getRoomAnalyzer(spawn.room);
    
    analyzer.analyzeEnergy();
    var result = analyzer.analyzeFriendlies();

    var expectedWorkerCount = result.energy.givers.sources.length * 2;
    var expectedTransporterCount = result.friendlies.creeps.workers.length * 2;
    
    spawnLog(
        "expectedWorkerCount="+expectedWorkerCount
        +",expectedTransporterCount="+expectedTransporterCount
    );
    
    function spawnLog(message){
        if(DEBUG) console.log('Spawner: '+message);
    }

    spawnLog(
        "Workers="+result.friendlies.creeps.workers.length
        +",Transporters="+result.friendlies.creeps.transporters.length
        +",Builders="+result.friendlies.creeps.builders.length
        +",Upgraders="+result.friendlies.creeps.upgraders.length
    );
    
    if (analyzer.hostileCount != 0 && analyzer.hostileCount > analyzer.guardCount && analyzer.workerCount > 0) {
        spawnLog('Spawning a new Guard');
        factory.spawnGuard(spawn);
    }   
    else if (result.friendlies.creeps.transporters.length < expectedTransporterCount) {
        spawnLog('Spawning a new Transporter');
        factory.spawnTransporter(spawn);
    }
    else if (result.friendlies.creeps.workers.length < expectedWorkerCount) {
        spawnLog('Spawning a new Worker. workers='+result.friendlies.creeps.workers.length+', expected='+expectedWorkerCount);
        factory.spawnWorker(spawn);
    }
    else if ((analyzer.constructionSiteCount > 0 || analyzer.repairSiteCount > 0) && result.friendlies.creeps.builders.length < 2 && result.friendlies.creeps.workers.length > 1) {
        spawnLog('Spawning a new Builder');
        factory.spawnBuilder(spawn);
    }
    else if (analyzer.upgraderCount < 1 && analyzer.workerCount > 1) {
        if (analyzer.constructionSiteCount > 5 && analyzer.upgraderCount > 1) {
            //build nothing
        }
        else {
            spawnLog('Spawning a new Upgrade');
            factory.spawnUpgrader(spawn);
        }
    }
};

