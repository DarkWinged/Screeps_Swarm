var job = require('job');
var job_harvest = {
    //require('job_harvest').init('drone_id','source_id')
    init: function(Source_ID, Target_ID){
        let Job_ID = job.init(Source_ID, Target_ID);
        Memory.jobs[Job_ID].Job_Type = 'harvest';
        Memory.jobs[Job_ID].Assigned_Max = 1;
        return Job_ID;
    },
    
    work: function(Job_ID){
        let origin = Game.flags[Memory.jobs[Job_ID].Source_ID];
        for(let drone in Memory.jobs[Job_ID].Assigned_ID){
            let creep = Game.creeps[Memory.jobs[Job_ID].Assigned_ID[drone]];

            if(creep != null){
                let source = Game.getObjectById(Memory.jobs[Job_ID].Target_ID);
                if(creep.room != origin.room){
                    creep.moveTo(origin, {visualizePathStyle: {stroke: '#ffffff'}});
                } else {
                    let valid_container = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (
                                structure.structureType == STRUCTURE_CONTAINER &&
                                (
                                    structure.pos.x == creep.pos.x &&
                                    structure.pos.y == creep.pos.y
                                )
                            );
                        }
                    });
                    
                    if(
                        creep.store.getFreeCapacity() > 0 ||
                        (
                            valid_container.length > 0 &&
                            valid_container[0].store.getFreeCapacity() > 0
                        )
                    ){
                        let result = creep.harvest(source);
                        if(result == ERR_NOT_IN_RANGE){
                            creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
                        } 
                        if(result == 0){
                            Memory.drones[Memory.jobs[Job_ID].Assigned_ID[drone]].Fitness_Score += 2;
                        }
                    }
                }
            } else {
                //require('drone').terminate(creep);
            }
        }
    },
        
    assign: function(Drone_ID){
        return job.assign(Drone_ID, Memory.drones[Drone_ID].Drone_Role);
    },

    closeJob: function(Job_ID){
        job.closeJob(Job_ID);
    }
      
};

module.exports = job_harvest;