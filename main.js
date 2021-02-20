module.exports.loop = function () {
    if(!Memory.init){
        Memory.jobs = {};
        Memory.drones = {};
        Memory.nests = {};
        Memory.jobless = [];
        require('nest_hatchery').init(Game.spawns['Spawn1'].id);
        require('nest_hatchery').queue_harvester(Game.spawns['Spawn1'].id);
        require('nest_hatchery').queue_transporter(Game.spawns['Spawn1'].id);
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
    
    let hatcheries = _.filter(Memory.nests, (Nest) => Nest.Role = 'hatchery');
    
    for(let hatchery in hatcheries){
        let spawn = Game.getObjectById(hatcheries[hatchery].Nest_ID);
        if(spawn){
            require('nest_hatchery').process_queue(spawn.id);
        }
    }
    
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
    
    let drone_cleanup = _.filter(Memory.drones,(Drone) => !Game.creeps[Drone.Drone_ID]);
    let job_cleanup = _.filter(Memory.jobs,(Job) => !Job.Source_ID || !Game.creeps[Job.Source_ID]);
    //console.log(cleanup);
    
    for(let entity in drone_cleanup){
        let entity_id = drone_cleanup[entity].Drone_ID;
        let closed_jobs = _.filter(Memory.jobs, (Job) => String(Job).includes(entity_id));
        let opened_jobs = _.filter(Memory.jobs, (Job) => Job.Assigned_ID == entity_id);
        console.log(entity_id);
        for(let closed_job in closed_jobs){
            let job_id = '' + closed_jobs[closed_job].Source_ID + '-' + closed_jobs[closed_job].Target_ID;
            if(Game.creeps[Memory.jobs[job_id].Assigned_ID])
                Memory.jobless.push(Memory.jobs[job_id].Assigned_ID);
            console.log(job_id);
            delete(Memory.jobs[job_id]);
        }
        for(let opened_job in opened_jobs){
            let job_id = '' + opened_jobs[opened_job].Source_ID + '-' + opened_jobs[opened_job].Target_ID;
            Memory.jobs[job_id].Assigned_ID = 'null';
        }
        delete(Memory.drones[entity_id]);
        delete(Memory.creeps[entity_id]);
    }
    
    for(let closed_job in job_cleanup){
            let job_id = '' + job_cleanup[closed_job].Source_ID + '-' + job_cleanup[closed_job].Target_ID;
            console.log(job_id);
            if(Game.creeps[Memory.jobs[job_id].Assigned_ID])
                Memory.jobless.push(Memory.jobs[job_id].Assigned_ID);
            delete(Memory.jobs[job_id]);
    }
    
    if(Memory.jobless.length > 0){
        let unemployed_id = Memory.jobless[0];
        let sucess = _.filter(Memory.jobs, (Job) => Job.Assigned_ID == unemployed_id)
        if(sucess.length > 0 || !Memory.jobless[0]){
            Memory.jobless.reverse();
            Memory.jobless.pop();
            Memory.jobless.reverse();
        }
        console.log(unemployed_id, Memory.drones[unemployed_id].Drone_Role)
        switch(Memory.drones[unemployed_id].Drone_Role){
            case 'transporter':
                require('job_route').assign(unemployed_id);
                break;
        }
    }
}