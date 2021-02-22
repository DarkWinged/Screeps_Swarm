var job = require('job');
var job_repair = {
    //require('job_harvest').init('drone_id','source_id')
    init: function(Source_ID, Target_ID){
        job.init(Source_ID, Target_ID);
        let Job_ID = '' + Source_ID + '-' + Target_ID;
        Memory.jobs[Job_ID].Job_Type = 'repair';
        Memory.jobs[Job_ID].Assigned_Max = 1;
    },
    
    
    work: function(Job_ID){
        for(let drone in Memory.jobs[Job_ID].Assigned_ID){
            let creep = Game.creeps[Memory.jobs[Job_ID].Assigned_ID[drone]];
            if(creep){
                let spawn  = Game.getObjectById(Memory.jobs[Job_ID].Target_ID);

                let target = Game.getObjectById(Memory.jobs[Job_ID].Source_ID);
                creep.say('' + Math.floor((target.hits/target.hitsMax)*100) + '%');
                if(target && target.hits < target.hitsMax) {
                    if(creep.store[RESOURCE_ENERGY] < 1) {
                        if(Memory.nests[Memory.jobs[Job_ID].Target_ID].Drone_Queue.length == 0 && Memory.nests[Memory.jobs[Job_ID].Target_ID].Queue_Current.state == false){
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
                    } else if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    } else {
                        Memory.drones[Memory.jobs[Job_ID].Assigned_ID[drone]].Fitness_Score += 1;
                    }
                } else {
                    require('job_repair').close_job(Job_ID);
                }
            }
        }
    },

    assign: function(Drone_ID){
        let jobs = _.filter(Memory.jobs, (Job) => Job.Job_Type == 'repair');
        jobs = jobs.sort((a,b) => (Game.getObjectById(a.Source_ID).hits > Game.getObjectById(b.Source_ID).hits) ? 1 : -1);
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

module.exports = job_repair;