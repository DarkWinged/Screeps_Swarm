var job = {
    init: function(Entity_ID_A, Entity_ID_B){
        let Job_ID = '' + Entity_ID_A + '-' + Entity_ID_B;
        Memory.jobs[Job_ID] = {Source_ID: Entity_ID_A, Target_ID: Entity_ID_B, Job_Type: 'null'};
        console.log('New Job: ' + Job_ID);
    }
};

module.exports = job;