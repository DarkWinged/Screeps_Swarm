module.exports.loop = function () {
    if(!Memory.init){
        Memory.jobs = {};
        Memory.drones = {};
        Memory.nests = {};
        Memory.jobless = [];
        require('nest_hatchery').init(Game.spawns['Spawn1'].id);
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
    
    let maintain_sites = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return ((structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART) &&
                structure.hits < structure.hitsMax);
        }
    });
    let maintain_jobs = _.filter(Memory.jobs,(Job) => Job.Job_Type == 'repair');

    if(maintain_sites.length > maintain_jobs.length){
        maintain_sites = _.filter(maintain_sites, (job) => !maintain_jobs.includes(job.Source_ID + '-' + job.Target_ID))
        for(let site in maintain_sites){
            require('job_repair').init(maintain_sites[site].id, Game.spawns['Spawn1'].id);
        }
    }

    let construct_sites = Game.spawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES);
    let job_sites = _.filter(Memory.jobs,(Job) => Job.Job_Type == 'build');

    if(construct_sites.length > job_sites.length){
        construct_sites = _.filter(construct_sites, (job) => !job_sites.includes(job.Source_ID + '-' + job.Target_ID))
        for(let site in construct_sites){
            require('job_build').init(construct_sites[site].id, Game.spawns['Spawn1'].id);
        }
    }
                    
    let drone_cleanup = _.filter(Memory.drones,(Drone) => !Game.creeps[Drone.Drone_ID]);
    let job_cleanup = _.filter(Memory.jobs,(Job) => !Game.creeps[Job.Source_ID] && !Game.getObjectById(Job.Source_ID));
    //console.log(cleanup);
    
    for(let closed_job in job_cleanup){
        let Job_ID = '' + job_cleanup[closed_job].Source_ID + '-' + job_cleanup[closed_job].Target_ID;
        if(Memory.jobs[Job_ID] != undefined)
            require('job').close_job(Job_ID);
        else{
            delete(Memory.jobs[Job_ID]);
            Memory.jobs = _.filter(Memory.jobs, (job) => job != null);
        }
    }

    for(let entity in drone_cleanup){
        let entity_id = drone_cleanup[entity].Drone_ID;
        let closed_jobs = _.filter(Memory.jobs, (Job) => String(Job).includes(entity_id));
        let opened_jobs = _.filter(Memory.jobs, (Job) => Job.Assigned_ID.includes(entity_id));
        console.log('opened jobs:', opened_jobs.length);
        console.log('Deleted Drone: ', entity_id);
        for(let closed_job in closed_jobs){
            let Job_ID = '' + closed_jobs[closed_job].Source_ID + '-' + closed_jobs[closed_job].Target_ID;
            require('job').close_job(Job_ID);
        }
        for(let opened_job in opened_jobs){
            let Job_ID = '' + opened_jobs[opened_job].Source_ID + '-' + opened_jobs[opened_job].Target_ID;
            console.log('pre delete:', Memory.jobs[Job_ID].Assigned_ID.length);
            Memory.jobs[Job_ID].Assigned_ID = _.filter(Memory.jobs[Job_ID].Assigned_ID, (eitity) => eitity != entity_id);
            console.log('post delete:', Memory.jobs[Job_ID].Assigned_ID.length);
        }
        delete(Memory.drones[entity_id]);
        delete(Memory.creeps[entity_id]);
    }

    Memory.jobless = _.filter(Memory.jobless, (job) => job != null);
    if(Memory.jobless.length > 0){
        Memory.jobless.reverse();
        let unemployed_id = Memory.jobless.pop();
        Memory.jobless.reverse();
        //console.log(unemployed_id, Memory.drones[unemployed_id].Drone_Role)
        if(Game.creeps[unemployed_id]){
            let jobs = _.filter(Memory.jobs,(Job) => Job.Assigned_ID.length < Job.Assigned_Max);
            
            if(jobs.length != 0)
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
                        if(!require('job_upgrade').assign(unemployed_id))
                            if(!require('job_repair').assign(unemployed_id))
                                if(!require('job_build').assign(unemployed_id))
                                    Memory.jobless.push(unemployed_id);
                        break;
                    case 'scout':
                        if(!require('job_scout').assign(unemployed_id))
                            Memory.jobless.push(unemployed_id);
                        break;
                }
            }
        }
    }
    
    let jobs = Memory.jobs;
    let harvest_count = 0;
    let route_count = 0;
    
    for(let job in jobs){
        let Job_ID = '' + jobs[job].Source_ID + '-' + jobs[job].Target_ID;
        if(Memory.jobs[Job_ID] != undefined){
            switch(Memory.jobs[Job_ID].Job_Type){
                case 'route':
                    require('job_route').work(Job_ID);
                    route_count += Memory.jobs[Job_ID].Assigned_Max;
                    break;
                case 'harvest':
                    require('job_harvest').work(Job_ID);
                    harvest_count += Memory.jobs[Job_ID].Assigned_Max;
                    break; 
                case 'build':
                    require('job_build').work(Job_ID);
                    break;
                case 'upgrade':
                    require('job_upgrade').work(Job_ID);
                    break;
                case 'repair':
                    require('job_repair').work(Job_ID);
                    break;
                case 'scout':
                    require('job_scout').work(Job_ID);
                    break;
            };   
        } else {
            delete(Memory.jobs[Job_ID]);
            Memory.jobs = _.filter(Memory.jobs, (job) => job != null);
        }
    }
    
    let roles = ['transporter','harvester','builder','scout'];
    for(let role in roles){
        let filtered_drones = _.filter(Memory.drones, (Drone) => Drone.Drone_Role == roles[role]);
        filtered_drones = filtered_drones.concat(_.filter(Memory.nests[Game.spawns['Spawn1'].id].Drone_Queue, (Drone) => Drone.role == roles[role]));
        if(Memory.nests[Game.spawns['Spawn1'].id].Queue_Current.role == roles[role]){
            filtered_drones.push(Memory.nests[Game.spawns['Spawn1'].id].Queue_Current);
        }
        switch(roles[role]){
            case 'transporter':
                if(route_count - filtered_drones.length > 0){
                    require('nest_hatchery').queue_transporter(Game.spawns['Spawn1'].id);
                }
                break;
            case 'harvester':
                if(harvest_count - filtered_drones.length > 0){
                    require('nest_hatchery').queue_harvester(Game.spawns['Spawn1'].id);
                }
                break;
            case 'builder':
                if(6 - filtered_drones.length > 0){
                    require('nest_hatchery').queue_builder(Game.spawns['Spawn1'].id);
                }
                break;
            case 'scout':
                if(1 - filtered_drones.length > 0){
                    require('nest_hatchery').queue_scout(Game.spawns['Spawn1'].id);
                }
                break;
        }
    }
}