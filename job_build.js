var job = require('job');
var job_build = {
    //require('job_harvest').init('drone_id','source_id')
    init: function(Source_ID, Target_ID){
        job.init(Source_ID, Target_ID);
        let Job_ID = '' + Source_ID + '-' + Target_ID;
        Memory.jobs[Job_ID].Assigned_ID = 'null';
        Memory.jobs[Job_ID].Job_Type = 'build';
    },
    
    work: function(Job_ID){
        let creep = Game.creeps[Memory.jobs[Job_ID].Assigned_ID];
        if(creep){
            let spawn  = Game.getObjectById(Memory.jobs[Job_ID].Target_ID);

            var target = spawn.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
            if(target)
            {
                if(creep.store[RESOURCE_ENERGY] < 1) {
                    if(Memory.nests[Memory.jobs[Job_ID].Target_ID].Drone_Queue.length == 0 && Memory.nests[Memory.jobs[Job_ID].Target_ID].Queue_Current.state == false){
                        if(creep.withdraw(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                            creep.moveTo(spawn.pos.x,spawn.pos.y);
                        }
                    }
                } else if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    },

    assign: function(Drone_ID){
        let jobs = _.filter(Memory.jobs, (Job) => Job.Job_Type == 'build');
        for(var job in jobs){
            let job_id = '' + jobs[job].Source_ID + '-' + jobs[job].Target_ID;
            if(Memory.jobs[job_id].Assigned_ID == 'null'){
                Memory.jobs[job_id].Assigned_ID = Drone_ID;
                console.log('New assignment:', Drone_ID, 'at', job_id);
                return true;
                break;
            }
        }
        false;
    }
};

module.exports = job_build;