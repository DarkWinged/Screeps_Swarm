var job = require('job');
var job_route = {
    //require('job_route').init('drone_id','nest_id')
    init: function(Source_ID, Target_ID){
        job.init(Source_ID, Target_ID);
        let Job_ID = '' + Source_ID + '-' + Target_ID;
        Memory.jobs[Job_ID].Job_Type = 'route';
        Memory.jobs[Job_ID].Assigned_Max = 2;
    },
    
    work: function(Job_ID){
        for(let drone in Memory.jobs[Job_ID].Assigned_ID){
            if(Game.creeps[Memory.jobs[Job_ID].Assigned_ID[drone]]){
                let creep = Game.creeps[Memory.jobs[Job_ID].Assigned_ID[drone]];
                let start = Game.creeps[Memory.jobs[Job_ID].Source_ID];
                let end = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) >= 25);
                    }
                });
                
                if(!Memory.drones[creep.name].State){
                    if(start.transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                        creep.moveTo(start.pos.x,start.pos.y, {visualizePathStyle: {stroke: '#ffffff'}});
                    } else {
                        if(creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
                            Memory.drones[creep.name].State = true;
                        }
                    }
                } else {
                    if(creep.transfer(end, RESOURCE_ENERGY, 25) == ERR_NOT_IN_RANGE){
                        creep.moveTo(end, {visualizePathStyle: {stroke: '#ffffff'}});
                    } else {
                        Memory.drones[Memory.jobs[Job_ID].Assigned_ID[drone]].Fitness_Score += 25;
                        if(creep.store.getUsedCapacity(RESOURCE_ENERGY) < 25){
                            Memory.drones[creep.name].State = false;
                        }
                    }
                }
            } else {
                Memory.jobs[Job_ID].Assigned_ID = _.filter(Memory.jobs[Job_ID].Assigned_ID, (eitity) => eitity != drone);
            }
        }
    },

    assign: function(Drone_ID){
        let jobs = _.filter(Memory.jobs, (Job) => Job.Job_Type == 'route');
        for(var job in jobs){
            let Job_ID = '' + jobs[job].Source_ID + '-' + jobs[job].Target_ID;
            if(Memory.jobs[Job_ID].Assigned_ID.length < Memory.jobs[Job_ID].Assigned_Max){
                Memory.jobs[Job_ID].Assigned_ID.push(Drone_ID);
                return true;
            }
        }
        return false;
    },

    close_job: function(Job_ID){
        job.init(Job_ID);
    }
        
};

module.exports = job_route;