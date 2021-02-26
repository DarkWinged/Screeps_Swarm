var drone = {
    init: function(drone_id, spawn_id){
        Memory.drones[drone_id] = {
            Drone_ID: '' + drone_id,
            Spawn_ID: '' + spawn_id,
            Drone_Role: 'drone',
            Fitness_Score: 100
        };
        Memory.jobless.push(drone_id);
        return drone_id;
    },

    terminate: function(Drone_ID){
        let closed_jobs = _.filter(Memory.jobs, (Job) => String('' + Job.Source_ID + '-' + Job.Target_ID).includes(Drone_ID));
        let opened_jobs = _.filter(Memory.jobs, (Job) => Job.Assigned_ID.includes(Drone_ID));

        console.log('opened jobs:', opened_jobs.length);
        console.log('Deleted Drone: ', Drone_ID);

        for(let closed_job in closed_jobs){
            let Job_ID = '' + closed_jobs[closed_job].Source_ID + '-' + closed_jobs[closed_job].Target_ID;
            require('job').close_job(Job_ID);
        }

        for(let opened_job in opened_jobs){
            console.log('Job Opening:', opened_jobs[opened_job].Source_ID + '-' + opened_jobs[opened_job].Target_ID);
            
            let Job_ID = '' + opened_jobs[opened_job].Source_ID + '-' + opened_jobs[opened_job].Target_ID;
            
            console.log('pre delete:', Memory.jobs[Job_ID].Assigned_ID.length);

            Memory.jobs[Job_ID].Assigned_ID = _.filter(Memory.jobs[Job_ID].Assigned_ID, (eitity) => eitity != Drone_ID);

            console.log('post delete:', Memory.jobs[Job_ID].Assigned_ID.length);
        }

        delete(Memory.drones[Drone_ID]);
        delete(Memory.creeps[Drone_ID]);
    }
};

module.exports = drone;