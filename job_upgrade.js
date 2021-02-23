var job = require('job');
var job_upgrade = {
    //require('job_upgrade').init('drone_id','source_id')
    init: function(Source_ID, Target_ID){
        job.init(Source_ID, Target_ID);
        let Job_ID = '' + Source_ID + '-' + Target_ID;
        Memory.jobs[Job_ID].Job_Type = 'upgrade';
        Memory.jobs[Job_ID].Assigned_Max = 3;
    },
    
    work: function(Job_ID){
        for(let drone in Memory.jobs[Job_ID].Assigned_ID){
            let creep = Game.creeps[Memory.jobs[Job_ID].Assigned_ID[drone]];
            if(Memory.jobs[Job_ID].Assigned_ID.length > Memory.jobs[Job_ID].Assigned_Max){
                Memory.jobless.push(Memory.jobs[Job_ID].Assigned_ID[drone]);
                delete(Memory.jobs[Job_ID].Assigned_ID[drone]);
                Memory.jobs[Job_ID].Assigned_ID = _.filter(Memory.jobs[Job_ID].Assigned_ID, (entity) => entity != null);
            } else if(creep) {
                let spawn  = Game.getObjectById(Memory.jobs[Job_ID].Source_ID);

                var target = spawn.room.controller;
                if(target)
                {
                    creep.say('U:' + Math.floor((target.progress/target.progressTotal)*100) + '%');
                    if(creep.store[RESOURCE_ENERGY] < 1) {
                        if(Memory.nests[spawn.id].Drone_Queue.length == 0 && Memory.nests[spawn.id].Queue_Current.state == false){
                            let resuply = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                                filter: (structure) => {
                                    return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN ||
                                        structure.structureType == STRUCTURE_CONTAINER) &&
                                        structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
                                }
                            });
                            if(creep.withdraw(resuply, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                                creep.moveTo(resuply, {visualizePathStyle: {stroke: '#ffffff'}});
                            }
                        } else {
                            let resuply = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                                filter: (structure) => {
                                    return ((structure.structureType == STRUCTURE_CONTAINER) &&
                                        structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
                                }
                            });
                            if(creep.withdraw(resuply, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                                creep.moveTo(resuply, {visualizePathStyle: {stroke: '#ffffff'}});
                            }
                        }
                    } else if(creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    } else {
                        Memory.drones[Memory.jobs[Job_ID].Assigned_ID[drone]].Fitness_Score += 1;
                    }
                }
            }
        }
    },

    assign: function(Drone_ID){
        let jobs = _.filter(Memory.jobs, (Job) => Job.Job_Type == 'upgrade');
        for(var job in jobs){
            let Job_ID = '' + jobs[job].Source_ID + '-' + jobs[job].Target_ID;
            if(Memory.jobs[Job_ID].Assigned_ID.length < Memory.jobs[Job_ID].Assigned_Max){
                Memory.jobs[Job_ID].Assigned_ID.push(Drone_ID);
                console.log('New assignment:', Drone_ID, 'at', Job_ID);
                return true;
            }
        }
        return false;
    },

    close_job: function(Job_ID){
        job.close_job(Job_ID);
    }
     
};

module.exports = job_upgrade;