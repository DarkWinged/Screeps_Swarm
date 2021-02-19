var job = require('job');
var job_harvest = {
    //require('job_harvest').init('drone_id','source_id')
    init: function(Entity_ID_A, Entity_ID_B){
        job.init(Entity_ID_A, Entity_ID_B);
        let Job_ID = '' + Entity_ID_A + '-' + Entity_ID_B;
        Memory.jobs[Job_ID].Job_Type = 'harvest';
    },
    
    work: function(Job_ID){
        let creep = Game.creeps[Memory.jobs[Job_ID].Source_ID];
        let source = Game.getObjectById(Memory.jobs[Job_ID].Target_ID);
        if(creep.store.getFreeCapacity() > 0)
            creep.harvest(source);
        creep.moveTo(source.pos.x,source.pos.y);
    }
};

module.exports = job_harvest;