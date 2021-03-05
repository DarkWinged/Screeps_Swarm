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
        let target = Game.getObjectById(Memory.jobs[Job_ID].Target_ID);
        if(Memory.jobs[Job_ID] != null && Memory.jobs[Job_ID].Assigned_ID.length > 0){
            //console.log('building:',Job_ID);
            for(let drone in Memory.jobs[Job_ID].Assigned_ID){
                let creep = Game.creeps[Memory.jobs[Job_ID].Assigned_ID[drone]];
                if(creep != null){                
                    
                    if(target != null) {
                        creep.say('B:' + Math.floor((target.progress/target.progressTotal)*100) + '%');
                        
                        if(creep.store[RESOURCE_ENERGY] < 1)
                            Memory.drones[creep.name].Resupply = true;

                        if(Memory.drones[creep.name].Resupply) {
                            require('job_build').resuply(creep.name, Job_ID);
                        } else {
                            if(creep.room == target.room && (creep.pos.x != 0 && creep.pos.x != 49 && creep.pos.y != 0 && creep.pos.y != 49)){
                                let opening_capacity = creep.store.getUsedCapacity();

                                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                                } else {
                                    let closing_capacity = creep.store.getUsedCapacity();
                                    Memory.drones[Memory.jobs[Job_ID].Assigned_ID[drone]].Fitness_Score += opening_capacity - closing_capacity;
                                }
                            } else {
                                creep.moveTo(Game.flags[Memory.jobs[Job_ID].Source_ID], {visualizePathStyle: {stroke: '#ffffff'}});
                            }
                        }
                    }
                }
            }
        }
    },
                            
    assign: function(Drone_ID){
        return job.assign(Drone_ID, Memory.drones[Drone_ID].Drone_Role);
    },

    resuply: function(drone, Job_ID){
        let creep = Game.creeps[drone];
        if(creep.store.getFreeCapacity() == 0){
            Memory.drones[drone].Resupply = false;
        }

        if(creep.room != null && creep.room.name != Game.getObjectById(Memory.drones[drone].Spawn_ID).room.name){
            let resuply = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                filter: (drone) => {
                    return (
                        (
                            Memory.drones[drone.name].Drone_Role == 'harvest' ||
                            Memory.drones[drone.name].Drone_Role == 'transport'
                        ) &&
                        drone.store.getUsedCapacity() > 0
                    );
                }
            });
            if(resuply == null){
                creep.moveTo(Game.getObjectById(Memory.drones[drone].Spawn_ID), {visualizePathStyle: {stroke: '#ffffff'}});
            } else {
                let result = resuply.transfer(creep, RESOURCE_ENERGY)
                if(result == ERR_NOT_IN_RANGE)
                    creep.moveTo(resuply, {visualizePathStyle: {stroke: '#ffffff'}});
                if(result == 0 && Memory.drones[resuply.name].Drone_Role == 'transport')
                    Memory.drones[resuply.name].State = false;
            }
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
                    
            if(resuply == null){
                creep.moveTo(Game.flags[Memory.jobs[Job_ID].Source_ID], {visualizePathStyle: {stroke: '#ffffff'}});
            } else {   
                if(creep.withdraw(resuply, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(resuply, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
        if(creep.store.getFreeCapacity() == 0){
            Memory.drones[drone].Resupply = false;
        }
    },

    closeJob: function(Job_ID){
        job.closeJob(Job_ID);
    }
     
};

module.exports = job_build;