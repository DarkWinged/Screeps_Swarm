var hive_mind = {
    init: function(){  
        if(!Memory.init){
            Memory.jobs = {};
            Memory.drones = {};
            Memory.nests = {};
            Memory.jobless = [];
            require('nest_hatchery').init(Game.spawns['Spawn1'].id);
            Memory.init = true;
            for(name in Game.creeps){
                Game.creeps[name].suicide();
            }
            Memory.creeps = {};
        }
    },
    processNests: function(Nest_Role){
        let nests = _.filter(Memory.nests, (Nest) => Nest.Role == Nest_Role);
        
        for(let nest in nests){
            let spawn = Game.getObjectById(nests[nest].Nest_ID);
            if(spawn){
                switch(Nest_Role){
                    case 'hatchery':
                        require('nest_hatchery').work(spawn.id);
                        break;
                    case 'tower':
                        require('nest_tower').work(spawn.id);
                        break;
                }
            }
        }
    },

    createRepairJobs: function(Hatchery_ID){
        let spawn = Game.getObjectById(Hatchery_ID);
        let maintain_sites = spawn.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART) &&
                    structure.hits < structure.hitsMax);
            }
        });
        let maintain_jobs = _.filter(Memory.jobs,(Job) => Job.Job_Type == 'repair');
        
        if(maintain_sites.length > maintain_jobs.length){
            for(let job in maintain_jobs){
                maintain_sites = _.filter(maintain_sites, (site) => site.id != maintain_jobs[job].Source_ID);
            }
            for(let site in maintain_sites){
                require('job_repair').init(maintain_sites[site].id, Hatchery_ID);
                let upgrade_id = Hatchery_ID + '-' + spawn.room.controller.id;
                if(Memory.jobs[upgrade_id].Assigned_Max > 3){    
                    Memory.jobs[upgrade_id].Assigned_Max -= 1;
                }
            }
        }
    },

    createBuildJobs: function(Hatchery_ID, Target_Room){
        let spawn = Game.getObjectById(Hatchery_ID);
        let construct_sites = Game.rooms[Target_Room].find(FIND_CONSTRUCTION_SITES);
        let job_sites = _.filter(Memory.jobs,(Job) => Job.Job_Type == 'build');

        if(construct_sites.length > job_sites.length){
            let result = construct_sites.length - job_sites.length;
            for(let job in job_sites){
                construct_sites = _.filter(construct_sites, (site) => site.id != job_sites[job].Source_ID);
            }
            for(let site in construct_sites){
                require('job_build').init(Target_Room, construct_sites[site].id);
                let upgrade_id = Hatchery_ID + '-' + spawn.room.controller.id;
                if(Memory.jobs[upgrade_id].Assigned_Max > 3){    
                    Memory.jobs[upgrade_id].Assigned_Max -= 1;
                }
            }
            return result;
        } else {
            return 0;
        }
    },

    cleanupJobs: function(){
        let job_cleanup = _.filter(Memory.jobs,(Job) => !Game.creeps[Job.Source_ID] && !Game.getObjectById(Job.Source_ID));
    
        if(job_cleanup.length > 0){
            for(let closed_job in job_cleanup){
                let Job_ID = '' + job_cleanup[closed_job].Source_ID + '-' + job_cleanup[closed_job].Target_ID;

                if(Memory.jobs[Job_ID] != undefined)
                    require('job').close_job(Job_ID);
                else{
                    delete(Memory.jobs[Job_ID]);
                    //Memory.jobs = _.filter(Memory.jobs, (job) => job != null);
                }
            }
            return true;
        } else {
            return false;
        }
    },

    cleanupDrones: function(Spawn_ID){
        let drone_cleanup = _.filter(Memory.drones,(Drone) => !Game.creeps[Drone.Drone_ID]);

        if(drone_cleanup.length > 0){
            for(let drone in drone_cleanup){
                let Drone_ID = drone_cleanup[drone].Drone_ID;
                console.log('Drone to Cleanup:', Drone_ID);

                if(Memory.drones[Drone_ID] != undefined){
                    let spawn = Game.getObjectById(Memory.drones[Drone_ID].Spawn_ID);

                    if(spawn.spawing){
                        if(!Game.creeps[Drone_ID] && spawn.spawing.name != Drone_ID){
                            require('drone').terminate(Drone_ID);
                        }
                    } else {
                        if(!Game.creeps[Drone_ID]){
                            require('drone').terminate(Drone_ID);
                        }
                    }
                } else {
                    delete(Memory.drones[Drone_ID]);
                    delete(Memory.creeps[Drone_ID]);
                }
            }
            return true;
        } else {
            return false;
        }
    },

    processUnemployment: function(){
        Memory.jobless = _.filter(Memory.jobless, (job) => job != null);
        
        if(Memory.jobless.length > 0){
            Memory.jobless.reverse();
            let unemployed_id = Memory.jobless.pop();
            Memory.jobless.reverse();

            //console.log(unemployed_id, Memory.drones[unemployed_id].Drone_Role)

            if(Game.creeps[unemployed_id]){
                let jobs = _.filter(Memory.jobs,(Job) => Job.Assigned_ID.length < Job.Assigned_Max);
                //console.log('Open Positions:', jobs.length)
                if(jobs.length != 0)
                {
                    switch(Memory.drones[unemployed_id].Drone_Role){
                        case 'transport':
                            if(require('job_route').assign(unemployed_id) == -2)
                                Memory.jobless.push(unemployed_id);
                            break;
                        case 'harvest':
                            if(require('job_harvest').assign(unemployed_id) == -2)
                                Memory.jobless.push(unemployed_id);
                            break;
                        case 'build':
                            if(require('job_upgrade').assign(unemployed_id) != 0)
                                if(require('job_repair').assign(unemployed_id) != 0)
                                    if(require('job_build').assign(unemployed_id) == -2 ){
                                        Memory.jobless.push(unemployed_id);
                                        let spawn = Game.getObjectById(Memory.drones[unemployed_id].Spawn_ID);
                                        Memory.jobs[spawn.id + '-' + spawn.room.controller.id].Assigned_Max += 1;
                                    }
                            break;
                        case 'scout':
                            if(require('job_scout').assign(unemployed_id) != 0)
                                Memory.jobless.push(unemployed_id);
                            break;
                    }
                }
            }
        }

        return Memory.jobless.length;
    },

    processJob: function(Job_ID, job_count){
        switch(Memory.jobs[Job_ID].Job_Type){
            case 'transport':
                require('job_route').work(Job_ID);
                job_count['TRANSPORTER'] += Memory.jobs[Job_ID].Assigned_Max;
                break;
            case 'harvest':
                require('job_harvest').work(Job_ID);
                job_count['HARVESTER'] += Memory.jobs[Job_ID].Assigned_Max;
                break; 
            case 'build':
                require('job_build').work(Job_ID);
                job_count['BUILDER'] += Memory.jobs[Job_ID].Assigned_Max;
                break;
            case 'upgrade':
                require('job_upgrade').work(Job_ID);
                job_count['UPGRADER'] += Memory.jobs[Job_ID].Assigned_Max;
                break;
            case 'repair':
                require('job_repair').work(Job_ID);
                if(Memory.jobs[Job_ID] != null)
                    job_count['REPAIRER'] += Memory.jobs[Job_ID].Assigned_Max;
                break;
            case 'scout':
                require('job_scout').work(Job_ID);
                job_count['SCOUT'] += Memory.jobs[Job_ID].Assigned_Max;
                break;
        };
        return job_count;
    },

    populationControll: function(Nest_ID, job_count){
        let roles = ['transport','harvest','build','scout'];
        for(let role in roles){
            let filtered_drones = _.filter(Memory.drones, (Drone) => Drone.Drone_Role == roles[role]);

            filtered_drones = filtered_drones.concat(_.filter(Memory.nests[Nest_ID].Drone_Queue, (Drone) => Drone.role == roles[role]));
            if(Memory.nests[Nest_ID].Queue_Current.role == roles[role]){
                filtered_drones.push(Memory.nests[Nest_ID].Queue_Current);
            }

            switch(roles[role]){
                case 'transport':
                    if(job_count['TRANSPORTER'] - filtered_drones.length > 0){
                        require('nest_hatchery').queue_transporter(Nest_ID);
                    }
                    break;
                case 'harvest':
                    if(job_count['HARVESTER'] - filtered_drones.length > 0){
                        require('nest_hatchery').queue_harvester(Nest_ID);
                    }
                    break;
                case 'build':
                    if(10 - filtered_drones.length > 0){
                        require('nest_hatchery').queue_builder(Nest_ID);
                    }
                    break;
                case 'scout':
                    if(5 - filtered_drones.length > 0){
                        require('nest_hatchery').queue_scout(Nest_ID);
                    }
                    break;
            }
        }
    },
};

module.exports = hive_mind;