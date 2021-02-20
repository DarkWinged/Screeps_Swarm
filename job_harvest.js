var job = require('job');
var job_harvest = {
    //require('job_harvest').init('drone_id','source_id')
    init: function(Source_ID, Target_ID){
        job.init(Source_ID, Target_ID);
        let Job_ID = '' + Source_ID + '-' + Target_ID;
        Memory.jobs[Job_ID].Assigned_ID = 'null';
        Memory.jobs[Job_ID].Job_Type = 'harvest';
    },
    
    work: function(Job_ID){
        if(Game.creeps[Memory.jobs[Job_ID].Assigned_ID]){
            let creep = Game.creeps[Memory.jobs[Job_ID].Assigned_ID];
            let source = Game.getObjectById(Memory.jobs[Job_ID].Target_ID);
            if(creep.store.getFreeCapacity() > 0)
                creep.harvest(source);
            creep.moveTo(source.pos.x,source.pos.y, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    },

    assign: function(Drone_ID){
        let creep = Game.creeps[Drone_ID];
        //console.log(creep);
        let jobs = _.filter(Memory.jobs, (Job) => Job.Job_Type == 'harvest');
        for(var job in jobs){
            let job_id = '' + jobs[job].Source_ID + '-' + jobs[job].Target_ID;
            if(!Game.creeps[Memory.jobs[job_id].Assigned_ID]){
                Memory.jobs[job_id].Assigned_ID = Drone_ID;
                console.log('New assignment:', Drone_ID, 'at', job_id);
                return true;
                break;
            }
        }
        false;
    }
      
};

module.exports = job_harvest;