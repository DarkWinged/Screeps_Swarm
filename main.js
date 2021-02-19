module.exports.loop = function () {
    if(!Memory.init){
        Memory.jobs = {};
        Memory.drones = {};
        require('spawn_queue').grow_harvester();
        Memory.init = true;
    }
    
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
    	    //2,2,
    	    {fill: 'solid', radius: 1, stroke: '#ffFF06'}
        );
        
    };
    
    let harvesters = _.filter(Memory.jobs, (Job) => String(Job.Job_Type).includes("harvest"));
    
    for(let drone in harvesters){
        let creep = Game.creeps[harvesters[drone].Source_ID];
        if(creep){
            let source = harvesters[drone].Target_ID;
            let job_id = '' + harvesters[drone].Source_ID + '-' + harvesters[drone].Target_ID;
            require('job_harvest').work(job_id);
        }
    }
    
    let routes = _.filter(Memory.jobs, (Job) => String(Job.Job_Type).includes('route'));
    
    for(let route in routes){
        let creep = Game.creeps[routes[route].Source_ID];
        if(creep){
            let source = routes[route].Target_ID;
            let job_id = '' + routes[route].Source_ID + '-' + routes[route].Target_ID;
            require('job_route').work(job_id);
        }
    }
    
    let cleanup = _.filter(Memory.drones,(Drone) => !Game.creeps[Drone.Drone_ID]);
    //console.log(cleanup);
    
    for(let entity in cleanup){
        let entity_id = cleanup[entity].Drone_ID;
        let closed_jobs = _.filter(Memory.jobs, (Job) => String(Job).includes(entity_id));
        console.log(entity_id);
        for(let closed_job in closed_jobs){
            let job_id = '' + closed_jobs[closed_job].Source_ID + '-' + closed_jobs[closed_job].Target_ID;
            console.log(job_id);
            delete(Memory.jobs[job_id]);
        }
        delete(Memory.drones[entity_id]);
        delete(Memory.creeps[entity_id]);
    }
    
}