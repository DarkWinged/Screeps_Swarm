var job = {
    init: function(Entity_ID_A, Entity_ID_B){
        let Job_ID = '' + Entity_ID_A + '-' + Entity_ID_B;
        Memory.jobs[Job_ID] = {
            Source_ID: Entity_ID_A,
            Target_ID: Entity_ID_B,
            Job_Type: 'null',
            Assigned_ID: [],
            Assigned_Max: 0
        };
        console.log('New Job: ' + Job_ID);
    },

    close_job: function(job_id){
        for(let drone in Memory.jobs[job_id].Assigned_ID){
            if(Game.creeps[Memory.jobs[job_id].Assigned_ID[drone]])
                Memory.jobless.push(Memory.jobs[job_id].Assigned_ID[drone]);
        }
        console.log('Closed Job: ', job_id);
        delete(Memory.jobs[job_id]);
    }
};

module.exports = job;