var job = require('job');
var job_deposit = {
    //require('job_deposit').init('drone_id','drone_id')
    init: function(Entity_ID_A, Entity_ID_B){
        job.init(Entity_ID_A, Entity_ID_B);
        let Job_ID = '' + Entity_ID_A + '-' + Entity_ID_B;
        Memory.jobs[Job_ID].cargo_max = Game.creeps[Entity_ID_A].store.getCapacity();
    }
};

module.exports = job_deposit;