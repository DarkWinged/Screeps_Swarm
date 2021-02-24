var job = require('job');
var job_harvest = {
    //require('job_harvest').init('drone_id','source_id')
    init: function(Source_ID, Target_ID){
        job.init(Source_ID, Target_ID);
        let Job_ID = '' + Source_ID + '-' + Target_ID;
        Memory.jobs[Job_ID].Job_Type = 'harvest';
        Memory.jobs[Job_ID].Assigned_Max = 1;
    },
    
    work: function(Job_ID){
        for(let drone in Memory.jobs[Job_ID].Assigned_ID){
            if(Game.creeps[Memory.jobs[Job_ID].Assigned_ID[drone]]){
                let creep = Game.creeps[Memory.jobs[Job_ID].Assigned_ID[drone]];
                let source = Game.getObjectById(Memory.jobs[Job_ID].Target_ID);
                //console.log(source);
                let valid_container = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_CONTAINER) &&
                            (structure.pos.x == creep.pos.x && structure.pos.y == creep.pos.y));
                    }
                });
                if(creep.store.getFreeCapacity() > 0 || (valid_container.length > 0 && valid_container[0].store.getFreeCapacity() > 0)){
                    if(creep.harvest(source) == ERR_NOT_IN_RANGE){
                        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
                    } else {
                        Memory.drones[Memory.jobs[Job_ID].Assigned_ID[drone]].Fitness_Score += 2;
                    }
                }
            }
        }
    },

    assign: function(Drone_ID){
        let creep = Game.creeps[Drone_ID];
        //console.log(creep);
        let jobs = _.filter(Memory.jobs, (Job) => Job.Job_Type == 'harvest');
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

module.exports = job_harvest;