module.exports.loop = function () {
    if(!Memory.init){
        Memory.jobs = {};
        Memory.drones = {};
        Memory.nests = {};
        Memory.jobless = [];
        require('nest_hatchery').init(Game.spawns['Spawn1'].id);
        require('nest_hatchery').queue_harvester(Game.spawns['Spawn1'].id);
        require('nest_hatchery').queue_transporter(Game.spawns['Spawn1'].id);
        require('nest_hatchery').queue_harvester(Game.spawns['Spawn1'].id);
        require('nest_hatchery').queue_transporter(Game.spawns['Spawn1'].id);
        require('nest_hatchery').queue_harvester(Game.spawns['Spawn1'].id);
        require('nest_hatchery').queue_transporter(Game.spawns['Spawn1'].id);
        require('nest_hatchery').queue_harvester(Game.spawns['Spawn1'].id);
        require('nest_hatchery').queue_transporter(Game.spawns['Spawn1'].id);
        require('nest_hatchery').queue_builder(Game.spawns['Spawn1'].id);
        require('nest_hatchery').queue_builder(Game.spawns['Spawn1'].id);
        Memory.init = true;
    }

    /*
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
    */
                
    let hatcheries = _.filter(Memory.nests, (Nest) => Nest.Role = 'hatchery');
    
    for(let hatchery in hatcheries){
        let spawn = Game.getObjectById(hatcheries[hatchery].Nest_ID);
        if(spawn){
            require('nest_hatchery').process_queue(spawn.id);
        }
    }
    
    if(Memory.jobless.length > 0){
        Memory.jobless.reverse();
        let unemployed_id = Memory.jobless.pop();
        Memory.jobless.reverse();
        //console.log(unemployed_id, Memory.drones[unemployed_id].Drone_Role)
        if(Game.creeps[unemployed_id]){

            let jobs = _.filter(Memory.jobs,(Job) => Job.Assigned_ID == unemployed_id);
            if(jobs.length == 0)
            {
                switch(Memory.drones[unemployed_id].Drone_Role){
                    case 'transporter':
                        if(!require('job_route').assign(unemployed_id))
                        Memory.jobless.push(unemployed_id);
                        break;
                    case 'harvester':
                        if(!require('job_harvest').assign(unemployed_id))
                        Memory.jobless.push(unemployed_id);
                        break;
                    case 'builder':
                        if(!require('job_build').assign(unemployed_id))
                        Memory.jobless.push(unemployed_id);
                        break;
                }
            }
        }
    }
                    
                    let drone_cleanup = _.filter(Memory.drones,(Drone) => !Game.creeps[Drone.Drone_ID]);
                    let job_cleanup = _.filter(Memory.jobs,(Job) => !Game.creeps[Job.Source_ID] && !Game.getObjectById(Job.Source_ID));
    //console.log(cleanup);
    
    for(let closed_job in job_cleanup){
            let job_id = '' + job_cleanup[closed_job].Source_ID + '-' + job_cleanup[closed_job].Target_ID;
            console.log('Closed Job: ', job_id);
            if(Game.creeps[Memory.jobs[job_id].Assigned_ID])
                Memory.jobless.push(Memory.jobs[job_id].Assigned_ID);
            delete(Memory.jobs[job_id]);
    }

    for(let entity in drone_cleanup){
        let entity_id = drone_cleanup[entity].Drone_ID;
        let closed_jobs = _.filter(Memory.jobs, (Job) => String(Job).includes(entity_id));
        let opened_jobs = _.filter(Memory.jobs, (Job) => Job.Assigned_ID == entity_id);
        console.log('Deleted Drone: ', entity_id);
        for(let closed_job in closed_jobs){
            let job_id = '' + closed_jobs[closed_job].Source_ID + '-' + closed_jobs[closed_job].Target_ID;
            if(Game.creeps[Memory.jobs[job_id].Assigned_ID])
                Memory.jobless.push(Memory.jobs[job_id].Assigned_ID);
            console.log('Closed Job: ', job_id);
            delete(Memory.jobs[job_id]);
        }
        for(let opened_job in opened_jobs){
            let job_id = '' + opened_jobs[opened_job].Source_ID + '-' + opened_jobs[opened_job].Target_ID;
            Memory.jobs[job_id].Assigned_ID = 'null';
        }
        delete(Memory.drones[entity_id]);
        delete(Memory.creeps[entity_id]);
    }

    let jobs = Memory.jobs;
    
    for(let job in jobs){
        let job_id = '' + jobs[job].Source_ID + '-' + jobs[job].Target_ID;
        switch(Memory.jobs[job_id].Job_Type){
            case 'route':
                require('job_route').work(job_id);
                break;
            case 'harvest':
                require('job_harvest').work(job_id);
                break;
            case 'build':
                require('job_build').work(job_id);
                break;
        };   
    }
    
    
    
}