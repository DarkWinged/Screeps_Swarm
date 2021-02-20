var job = require('job');
var job_route = {
    //require('job_route').init('drone_id','nest_id')
    init: function(Entity_ID_A, Entity_ID_B){
        job.init(Entity_ID_A, Entity_ID_B);
        let Job_ID = '' + Entity_ID_A + '-' + Entity_ID_B;
        Memory.jobs[Job_ID].Assigned_ID = 'null';
        Memory.jobs[Job_ID].Cargo_Min = 'null';
        Memory.jobs[Job_ID].Job_Type = 'route';
    },
    
    work: function(Job_ID){
        if(Memory.jobs[Job_ID].Assigned_ID != 'null'){
            let start = Game.creeps[Memory.jobs[Job_ID].Source_ID];
            let end = Game.getObjectById(Memory.jobs[Job_ID].Target_ID);
            let creep = Game.creeps[Memory.jobs[Job_ID].Assigned_ID];
            
            if(creep.store.getFreeCapacity() > 0){
                if(start.transfer(creep, RESOURCE_ENERGY, Memory.jobs[Job_ID].Cargo_Min) == ERR_NOT_IN_RANGE){
                    creep.moveTo(start.pos.x,start.pos.y);
                }
            } else {
                if(creep.transfer(end, RESOURCE_ENERGY, creep.store.getCapacity(RESOURCE_ENERGY)) == ERR_NOT_IN_RANGE){
                    creep.moveTo(end);
                }
            }
        }
    },
    
    assign: function(Drone_ID){
        let creep = Game.creeps[Drone_ID];
        let origin = Memory.drones[Drone_ID].Spawn_ID;
        let routes = _.filter(Memory.jobs, (Job) => String(Job.Target_ID).includes(origin));
        for(var route in routes){
            let job_id = '' + routes[route].Source_ID + '-' + routes[route].Target_ID;
            if(Memory.jobs[job_id].Assigned_ID == 'null'){
                Memory.jobs[job_id].Assigned_ID = creep.name;
                if(Memory.jobs[job_id].Cargo_Min == 'null'){
                    Memory.jobs[job_id].Cargo_Min = Game.creeps[Memory.jobs[job_id].Source_ID].store.getCapacity(RESOURCE_ENERGY);
                }
                break;
            }
        }
    }
        
};

module.exports = job_route;