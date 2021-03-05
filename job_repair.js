var job = require('job');
var job_repair = {
    //require('job_harvest').init('drone_id','source_id')
    init: function(Source_ID, Target_ID){
        let Job_ID = job.init(Source_ID, Target_ID);
        Memory.jobs[Job_ID].Job_Type = 'repair';
        Memory.jobs[Job_ID].Assigned_Max = 1;
        return Job_ID;
    },
    
    
    work: function(Job_ID){
        let target = Game.getObjectById(Memory.jobs[Job_ID].Target_ID);
        if(target != null && target.hit == target.hitsMax || target == null){
            return Memory.jobs[Job_ID].Complete = true;
        }
        if(Memory.jobs[Job_ID].Assigned_ID.length > 0){
            //console.log('rapairing:',Job_ID);
            for(let drone in Memory.jobs[Job_ID].Assigned_ID){
                let creep = Game.creeps[Memory.jobs[Job_ID].Assigned_ID[drone]];
                if(creep){
                    //console.log('is rapairing:',creep.name);
                    creep.say('R:' + Math.floor((target.hits/target.hitsMax)*100) + '%');
                    //creep.say(target.room.name);
                    if(target.hits < target.hitsMax) {

                        if(creep.store[RESOURCE_ENERGY] < 1)
                                Memory.drones[creep.name].Resupply = true;

                        if(Memory.drones[creep.name].Resupply) {
                            require('job_build').resuply(creep.name, Job_ID);
                        } else {
                            if(creep.room == target.room && (creep.pos.x != 0 && creep.pos.x != 49 && creep.pos.y != 0 && creep.pos.y != 49)){
                                let opening_capacity = creep.store.getUsedCapacity();
                                
                                if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                                } else {
                                    let closing_capacity = creep.store.getUsedCapacity();
                                    Memory.drones[Memory.jobs[Job_ID].Assigned_ID[drone]].Fitness_Score += opening_capacity - closing_capacity;
                                }
                            } else {
                                creep.moveTo(Game.flags[Memory.jobs[Job_ID].Source_ID], {visualizePathStyle: {stroke: '#ffffff'}});
                            }
                        }
                    } else {
                        return Memory.jobs[Job_ID].Complete = true;
                    }
                }
            }
        }
        return false;
    },

    assign: function(Drone_ID){
        let jobs = _.filter(Memory.jobs, (Job) => Job.Job_Type == 'repair' && Job.Assigned_ID.length < Job.Assigned_Max);
        
        let jobs_inroom = _.filter(jobs, (Job) => (
            (
                Game.getObjectById(Job.Source_ID) != null &&
                Game.getObjectById(Job.Source_ID).room == Game.creeps[Drone_ID].room
            ) || (
                Game.flags[Job.Source_ID] != null &&
                Game.flags[Job.Source_ID].room == Game.creeps[Drone_ID].room
            )
        ))
        
        console.log('Positions for:', Memory.drones[Drone_ID].Drone_ID, jobs.length);

        for(let job in jobs_inroom){
            let Job_ID = '' + jobs_inroom[job].Source_ID + '-' + jobs_inroom[job].Target_ID;
            let drone_ids = Memory.jobs[Job_ID].Assigned_ID;
            for(let id in drone_ids){
                if(drone_ids[id] == Drone_ID){
                    console.log('Is drone assigned:', Job_ID);
                    return -1;
                }
            }
            Memory.jobs[Job_ID].Assigned_ID.push(Drone_ID);
            console.log('Drones assigned to:', Job_ID, drone_ids.length, '/', Memory.jobs[Job_ID].Assigned_Max);
            return 0;
        }
        for(let job in jobs){
            let Job_ID = '' + jobs[job].Source_ID + '-' + jobs[job].Target_ID;
            let drone_ids = Memory.jobs[Job_ID].Assigned_ID;
            for(let id in drone_ids){
                if(drone_ids[id] == Drone_ID){
                    console.log('Is drone assigned:', Job_ID);
                    return -1;
                }
            }
            Memory.jobs[Job_ID].Assigned_ID.push(Drone_ID);
            console.log('Drones assigned to:', Job_ID, drone_ids.length, '/', Memory.jobs[Job_ID].Assigned_Max);
            return 0;
        }
        return -2;
    },

    closeJob: function(Job_ID){
        console.log('Closing Repair Job:', Job_ID);
        job.closeJob(Job_ID);
    }
     
};

module.exports = job_repair;