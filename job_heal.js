var job = require('job');
var job_heal = {
    //require('job_harvest').init('drone_id','source_id')
    init: function(Source_ID, Target_ID){
        let Job_ID = job.init(Source_ID, Target_ID);
        Memory.jobs[Job_ID].Job_Type = 'heal';
        Memory.jobs[Job_ID].Assigned_Max = 2;
        return Job_ID;
    },
    
    work: function(Job_ID){
        for(let drone in Memory.jobs[Job_ID].Assigned_ID){
            let creep = Game.creeps[Memory.jobs[Job_ID].Assigned_ID[drone]];

            if(creep != null){
                wounded = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                    filter: (drone) => {
                        return (
                            drone.hits < drone.hitsMax
                        );
                    }
                });
                
                if(wounded == null){
                    creep.moveTo(Game.flags[Memory.jobs[Job_ID].Source_ID], {visualizePathStyle: {stroke: '#00ff00'}});
                } else if(creep.heal(wounded) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(wounded, {visualizePathStyle: {stroke: '#00ff00'}});
                }
            } else {
                //require('drone').terminate(creep);
            }
        }
    },
        
    assign: function(Drone_ID){
        return job.assign(Drone_ID);
    },

    closeJob: function(Job_ID){
        //job.closeJob(Job_ID);
    }
      
};

module.exports = job_heal;