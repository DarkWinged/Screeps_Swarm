let hive_mind = require('hive_mind');
module.exports.loop = function () {
    
    hive_mind.init();
    
    var localRoom = Game.spawns['Spawn1'].room;
	Game.map.visual.rect(
        localRoom.getPositionAt(Game.spawns['Spawn1'].pos.x-1,Game.spawns['Spawn1'].pos.y-1),
	    2,2,
	    {fill: 'solid', stroke: '#ffFF06'}
        );
        
    var sources = localRoom.find(FIND_SOURCES);
    for(var ESource in sources){
        var pos = sources[ESource].pos;
        Game.map.visual.circle(
            localRoom.getPositionAt(pos.x, pos.y),
            {fill: 'solid', radius: 1, stroke: '#ffFF06'}
            );
    };

    let nest_roles = ['hatchery','tower'];
    for(let role in nest_roles){
        hive_mind.processNests(nest_roles[role]);
    }
    
    hive_mind.cleanupDrones();
    hive_mind.cleanupJobs();
    
    hive_mind.createRepairJobs(Game.spawns['Spawn1'].id);
    hive_mind.createBuildJobs(Game.spawns['Spawn1'].id);

    hive_mind.processUnemployment();
    
    let job_count = {'TRANSPORTER':0, 'HARVESTER':0, 'BUILDER':0, 'UPGRADER':0, 'REPAIRER':0, 'SCOUT':0};
    let jobs = _.filter(Memory.jobs, (job) => job != null);
    for(let job in jobs){
        job_count = hive_mind.processJob(jobs[job].Source_ID + '-' + jobs[job].Target_ID, job_count);
    }
    
    hive_mind.populationControll(Game.spawns['Spawn1'].id,job_count);    
    
}