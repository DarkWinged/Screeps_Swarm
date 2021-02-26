var job = require('job');
var job_route = {
    //require('job_route').init('drone_id','nest_id')
    init: function(Source_ID, Target_ID){
        let Job_ID = job.init(Source_ID, Target_ID);
        Memory.jobs[Job_ID].Job_Type = 'transport';
        Memory.jobs[Job_ID].Assigned_Max = 2;
        return Job_ID;
    },
    
    work: function(Job_ID){
        for(let drone in Memory.jobs[Job_ID].Assigned_ID){
            if(Memory.drones[Memory.jobs[Job_ID].Assigned_ID[drone]] != undefined){
                let creep = Game.creeps[Memory.jobs[Job_ID].Assigned_ID[drone]];
                let start = Game.creeps[Memory.jobs[Job_ID].Source_ID];
                let end = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            (
                                structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_STORAGE ||
                                structure.structureType == STRUCTURE_TOWER
                            ) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) >= 50
                        );
                    }
                });

                if(end == null){
                    end = Game.getObjectById(Memory.drones[creep.name].Spawn_ID);
                    //console.log(creep.name, end);
                }

                if(!Memory.drones[creep.name].State){
                    if(start.transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                        creep.moveTo(start, {visualizePathStyle: {stroke: '#ffffff'}});
                    } else {
                        if(creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
                            Memory.drones[creep.name].State = true;
                        }
                    }
                } else {
                    if(creep.transfer(end, RESOURCE_ENERGY, 50) == ERR_NOT_IN_RANGE){
                        creep.moveTo(end, {visualizePathStyle: {stroke: '#ffffff'}});
                    } else {
                        Memory.drones[Memory.jobs[Job_ID].Assigned_ID[drone]].Fitness_Score += 50;

                        if(creep.store.getUsedCapacity(RESOURCE_ENERGY) < 50){
                            Memory.drones[creep.name].State = false;
                        }
                    }
                }
            } else {
                console.log('drone', Memory.jobs[Job_ID].Assigned_ID[drone], 'does not exist!');
                delete(Memory.jobs[Job_ID].Assigned_ID[drone]);
                Memory.jobs[Job_ID].Assigned_ID = _.filter(Memory.jobs[Job_ID].Assigned_ID, (eitity) => eitity != null);
            }
        }
    },

    assign: function(Drone_ID){
        return job.assign(Drone_ID, Memory.drones[Drone_ID].Drone_Role);
    },

    close_job: function(Job_ID){
        job.close_job(Job_ID);
    }
        
};

module.exports = job_route;