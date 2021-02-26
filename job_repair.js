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
        for(let drone in Memory.jobs[Job_ID].Assigned_ID){
            let creep = Game.creeps[Memory.jobs[Job_ID].Assigned_ID[drone]];

            if(creep){
                let target = Game.getObjectById(Memory.jobs[Job_ID].Source_ID);

                if(target && target.hits < target.hitsMax) {
                    creep.say('R:' + Math.floor((target.hits/target.hitsMax)*100) + '%');

                    if(creep.store[RESOURCE_ENERGY] < 1 || Memory.drones[creep.name].State == true) {
                        Memory.drones[creep.name].State = true;
                        require('job_build').resuply(creep.name);
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
        let jobs = _.filter(Memory.jobs, (Job) => Job.Job_Type == 'repair' && Job.Assigned_ID.length < Job.Assigned_Max);
        //console.log(jobs.length);
        console.log('Positions for:', 'repair', jobs.length);
        for(let job in jobs){
            let Job_ID = '' + jobs[job].Source_ID + '-' + jobs[job].Target_ID;
            let drone_ids = Memory.jobs[Job_ID].Assigned_ID;
            console.log('Drones assigned to:', Job_ID, drone_ids.length, '/', Memory.jobs[Job_ID].Assigned_Max);
            for(let id in drone_ids){
                if(drone_ids[id] == Drone_ID){
                    console.log('Is drone assigned:', Job_ID);
                    return -1;
                }
            }
            Memory.jobs[Job_ID].Assigned_ID.push(Drone_ID);
            return 0;
        }
        return -2;
    },

    close_job: function(Job_ID){
        job.close_job(Job_ID);
    }
     
};

module.exports = job_repair;