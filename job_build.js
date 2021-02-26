var job = require('job');
var job_build = {
    //require('job_harvest').init('drone_id','source_id')
    init: function(Source_ID, Target_ID){
        let Job_ID = job.init(Source_ID, Target_ID);
        Memory.jobs[Job_ID].Job_Type = 'build';
        Memory.jobs[Job_ID].Assigned_Max = 3;
        return Job_ID;
    },
    
    work: function(Job_ID){
        if(Memory.jobs[Job_ID].Assigned_ID.length > 0){
            for(let drone in Memory.jobs[Job_ID].Assigned_ID){
                let creep = Game.creeps[Memory.jobs[Job_ID].Assigned_ID[drone]];
                if(creep != null){                
                    let target = Game.getObjectById(Memory.jobs[Job_ID].Target_ID);
                    
                    if(target != null) {
                        creep.say('B:' + Math.floor((target.progress/target.progressTotal)*100) + '%');
                        
                        if(creep.store[RESOURCE_ENERGY] < 1 || Memory.drones[creep.name].State == true) {
                            Memory.drones[creep.name].State = true;
                            require('job_build').resuply(creep.name);
                        } else if(creep.build(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                        } else if(creep.build(target) == 0) {
                            Memory.drones[Memory.jobs[Job_ID].Assigned_ID[drone]].Fitness_Score += 5;
                        }
                    } else {
                        require('job_build').close_job(Job_ID);
                    }
                }
            }
        }
    },
                            
    assign: function(Drone_ID){
        return job.assign(Drone_ID, Memory.drones[Drone_ID].Drone_Role);
    },

    resuply: function(drone){
        let creep = Game.creeps[drone];
        if(creep.room != Game.getObjectById(Memory.drones[drone].Spawn_ID).room){
            creep.moveTo(Game.getObjectById(Memory.drones[drone].Spawn_ID), {visualizePathStyle: {stroke: '#ffffff'}});
        } else if(
            Memory.nests[Memory.drones[drone].Spawn_ID].Drone_Queue.length == 0 &&
            Memory.nests[Memory.drones[drone].Spawn_ID].Queue_Current.state == false
        ){
                let resuply = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            (
                                structure.structureType == STRUCTURE_STORAGE ||
                                structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_CONTAINER
                                ) &&
                                structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
                                );
                    }
                });
                
                if(creep.withdraw(resuply, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(resuply, {visualizePathStyle: {stroke: '#ffffff'}});
                }
        } else {
            let resuply = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        (
                            structure.structureType == STRUCTURE_CONTAINER ||
                            structure.structureType == STRUCTURE_STORAGE
                            )&&
                            structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
                            );
                    }
                });
                    
            if(creep.withdraw(resuply, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(resuply, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        if(creep.store.getFreeCapacity() == 0){
            Memory.drones[drone].State = false;
        }
    },

    close_job: function(Job_ID){
        job.close_job(Job_ID);
    }
     
};

module.exports = job_build;