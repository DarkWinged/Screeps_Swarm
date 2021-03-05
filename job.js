var job = {
    init: function(source_id, target_id){
        let Job_ID = '' + source_id + '-' + target_id;
        Memory.jobs[Job_ID] = {
            Source_ID: source_id,
            Target_ID: target_id,
            Job_Type: 'null',
            Assigned_ID: [],
            Assigned_Max: 0
        };
        return Job_ID;
    },

    assign: function(Drone_ID){
        let jobs = _.filter(Memory.jobs, (Job) => Job.Job_Type == Memory.drones[Drone_ID].Drone_Role && Job.Assigned_ID.length < Job.Assigned_Max);
        let jobs_inroom = _.filter(jobs, (Job) => (
            (
                Game.getObjectById(Job.Source_ID) != null &&
                Game.getObjectById(Job.Source_ID).room == Game.creeps[Drone_ID].room
            ) || (
                Game.flags[Job.Source_ID] != null &&
                Game.flags[Job.Source_ID].room == Game.creeps[Drone_ID].room
            )
        ))
        
        console.log('Positions for:', Memory.drones[Drone_ID].Drone_ID, jobs.length);

        for(let job in jobs_inroom){
            let Job_ID = '' + jobs_inroom[job].Source_ID + '-' + jobs_inroom[job].Target_ID;
            let drone_ids = Memory.jobs[Job_ID].Assigned_ID;
            for(let id in drone_ids){
                if(drone_ids[id] == Drone_ID){
                    console.log('Is drone assigned:', Job_ID);
                    return -1;
                }
            }
            Memory.jobs[Job_ID].Assigned_ID.push(Drone_ID);
            console.log('Drones assigned to:', Job_ID, drone_ids.length, '/', Memory.jobs[Job_ID].Assigned_Max);
            return 0;
        }
        for(let job in jobs){
            let Job_ID = '' + jobs[job].Source_ID + '-' + jobs[job].Target_ID;
            let drone_ids = Memory.jobs[Job_ID].Assigned_ID;
            console.log('Drones assigned to:', Job_ID, drone_ids.length, '/', Memory.jobs[Job_ID].Assigned_Max);
            for(let id in drone_ids){
                if(drone_ids[id] == Drone_ID){
                    console.log('Is drone assigned:', Job_ID);
                    return -1;
                }
            }
            Memory.jobs[Job_ID].Assigned_ID.push(Drone_ID);
            return 0;
        }
        return -2;
    },

    closeJob: function(Job_ID){
        let assigned = Memory.jobs[Job_ID].Assigned_ID;
        for(let drone in assigned){
            let Drone_ID = assigned[drone];
            if(Game.creeps[Drone_ID] != null)
                require('hive_mind').unemploy(Drone_ID);
        }
        //console.log('Closed Job: ', Job_ID);
        delete(Memory.jobs[Job_ID]);
    }
};

module.exports = job;