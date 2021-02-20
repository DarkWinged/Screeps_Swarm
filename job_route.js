var job = require('job');
var job_route = {
    //require('job_route').init('drone_id','nest_id')
    init: function(Source_ID, Target_ID){
        job.init(Source_ID, Target_ID);
        let Job_ID = '' + Source_ID + '-' + Target_ID;
        Memory.jobs[Job_ID].Assigned_ID = 'null';
        Memory.jobs[Job_ID].Cargo_Min = 'null';
        Memory.jobs[Job_ID].Job_Type = 'route';
    },
    
    work: function(Job_ID){
        if(Game.creeps[Memory.jobs[Job_ID].Assigned_ID]){
            let start = Game.creeps[Memory.jobs[Job_ID].Source_ID];
            let end = Game.getObjectById(Memory.jobs[Job_ID].Target_ID);
            let creep = Game.creeps[Memory.jobs[Job_ID].Assigned_ID];
            
            if(creep.store.getFreeCapacity() > 0){
                if(start.transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(start.pos.x,start.pos.y, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                if(creep.transfer(end, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(end, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    },

    assign: function(Drone_ID){
        let jobs = _.filter(Memory.jobs, (Job) => Job.Job_Type == 'route');
        for(var job in jobs){
            let job_id = '' + jobs[job].Source_ID + '-' + jobs[job].Target_ID;
            if(Memory.jobs[job_id].Assigned_ID == 'null'){
                Memory.jobs[job_id].Assigned_ID = Drone_ID;
                if(Memory.jobs[job_id].Cargo_Min == 'null'){
                    Memory.jobs[job_id].Cargo_Min = Game.creeps[Memory.jobs[job_id].Source_ID].store.getCapacity(RESOURCE_ENERGY);
                }
                console.log('New assignment:', Drone_ID, 'at', job_id);
                return true;
                break;
            }
        }
        false;
    }
        
};

module.exports = job_route;