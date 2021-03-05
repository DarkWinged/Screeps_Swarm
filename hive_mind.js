var hive_mind = {
    init: function(){  
        Memory.jobs = {};
        Memory.drones = {};
        Memory.nests = {};
        Memory.jobless = [];
        
        for(let drone in Game.creeps){
            Game.creeps[drone].suicide();
        }
        Memory.creeps = {};
        require('nest_hatchery').init(Game.spawns['Spawn1'].id);
        console.log('Hive Mind is online');
        Memory.init = true;
        return Memory.init;
    },

    restart: function(){
        let creeps = Game.creeps;
        let jobs = Memory.jobs;
        let nests = Memory.nests;

        for(let job in jobs){
            Job_ID = jobs[job].Source_ID + '-' + jobs[job].Target_ID;
            require('job').closeJob(Job_ID);
        }

        for(let creep in creeps){
            Drone_ID = creeps[creep].name;
            require('hive_mind').unemploy(Drone_ID);
        }

        let drones = _.filter(Memory.drones, (drone) => drone.Drone_Role == 'harvest');
        
        for(let drone in drones){
            require('job_route').init(drones[drone].Drone_ID, drones[drone].Spawn_ID);
        }

        for(let nest in nests){
            require('nest_' + nests[nest].Role).init(nests[nest].Nest_ID);
        }

        require('nest_hatchery').init(Game.spawns['Spawn1'].id);
        Memory.init = true;
        console.log('Hive Mind is online');
        return Memory.init;
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

    createRepairJobs: function(Hatchery_ID, Flag_ID){
        let spawn = Game.getObjectById(Hatchery_ID);
        let maintain_sites = Game.flags[Flag_ID].room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART) &&
                    structure.hits < structure.hitsMax);
            }
        });
        let maintain_jobs = _.filter(Memory.jobs,(Job) => Job.Job_Type == 'repair');
        
        if(maintain_sites.length > maintain_jobs.length){
            let result = maintain_sites.length - maintain_jobs.length;
            for(let job in maintain_jobs){
                maintain_sites = _.filter(maintain_sites, (site) => site.id != maintain_jobs[job].Target_ID);
            }
            for(let site in maintain_sites){
                require('job_repair').init(Flag_ID, maintain_sites[site].id);
                let upgrade_id = spawn.id + '-' + spawn.room.controller.id;
                if(Memory.jobs[upgrade_id].Assigned_Max > 3){
                    Memory.jobs[upgrade_id].Assigned_Max -= 1;    
                    require('hive_mind').unemploy(Memory.jobs[upgrade_id].Assigned_ID.pop());
                }
            }
            return result;
        } else {
            return 0;
        }
    },

    createBuildJobs: function(Hatchery_ID, Flag_ID){
        let spawn = Game.getObjectById(Hatchery_ID);
        if(Game.flags[Flag_ID].room != null){
            let construct_sites = Game.flags[Flag_ID].room.find(FIND_CONSTRUCTION_SITES);
            let job_sites = _.filter(Memory.jobs,(Job) => Job.Job_Type == 'build');
            
            if(construct_sites.length > job_sites.length){
                let result = construct_sites.length - job_sites.length;
                for(let job in job_sites){
                    construct_sites = _.filter(construct_sites, (site) => site.id != job_sites[job].Target_ID);
                }
                for(let site in construct_sites){
                    require('job_build').init(Flag_ID, construct_sites[site].id);
                    let upgrade_id = Hatchery_ID + '-' + spawn.room.controller.id;
                    if(Memory.jobs[upgrade_id].Assigned_Max > 3){    
                        Memory.jobs[upgrade_id].Assigned_Max -= 1;    
                        require('hive_mind').unemploy(Memory.jobs[upgrade_id].Assigned_ID.pop());
                    }
                }
                return result;
            } else {
                return 0;
            }
        }
    },

    createHarvesterJobs: function(){
        let harvest_flags = _.filter(Game.flags,(Flag) => Flag.name.includes('harvest'));
        let harvest_jobs = _.filter(Memory.jobs,(Job) => Job.Job_Type == 'harvest');
            
        if(harvest_flags.length > 0){
            let result = harvest_flags.length - harvest_jobs.length;
            for(let job in harvest_jobs){
                harvest_flags = _.filter(harvest_flags, (flag) => flag.name != harvest_jobs[job].Source_ID);
            }
            for(let flag in harvest_flags){
                if(harvest_flags[flag].room != null){
                    let sources = harvest_flags[flag].room.find(FIND_SOURCES);
                    for(let source in sources){
                        require('job_harvest').init(harvest_flags[flag].name, sources[source].id);
                        console.log('New Harvest position:', harvest_flags[flag].name);
                    }
                } else {
                    console.log('Room is inactive:', harvest_flags[flag].name);
                }

            }
            return result;
        } else {
            return 0;
        }
    },

    createHealerJobs: function(Hatchery_ID){
        let heal_flags = _.filter(Game.flags,(Flag) => Flag.name.includes('heal'));
        let heal_jobs = _.filter(Memory.jobs,(Job) => Job.Job_Type == 'heal');
        
        if(heal_flags.length > heal_jobs.length){
            let result = heal_flags.length - heal_jobs.length;
            for(let job in heal_jobs){
                heal_flags = _.filter(heal_flags, (flag) => flag.name != heal_jobs[job].Source_ID);
            }
            for(let flag in heal_flags){
                require('job_heal').init(heal_flags[flag].name, Hatchery_ID);
                console.log('New Healer position:', heal_flags[flag].name);
            }
            return result;
        } else {
            return 0;
        }
    },

    createScoutJobs: function(Hatchery_ID){
        let scout_flags = _.filter(Game.flags,(Flag) => Flag.name.includes('scout'));
        let scout_jobs = _.filter(Memory.jobs,(Job) => Job.Job_Type == 'scout');

        if(scout_flags.length > scout_jobs.length){
            let result = scout_flags.length - scout_jobs.length;
            for(let job in scout_jobs){
                scout_flags = _.filter(scout_flags, (flag) => flag.name != scout_jobs[job].Source_ID);
            }
            for(let flag in scout_flags){
                require('job_scout').init(scout_flags[flag].name, Hatchery_ID);
                console.log('New Healer position:', scout_flags[flag].name);
            }
            return result;
        } else {
            return 0;
        }
    },

    cleanupJobs: function(){
        let job_cleanup = _.filter(Memory.jobs,(Job) => (
            (
                Job.Job_Type == 'transport' &&
                !Game.creeps[Job.Source_ID]
            ) || (  
                Job.Job_Type == 'build' &&
                (
                    Game.flags[Job.Source_ID] == null ||
                    Game.getObjectById(Job.Target_ID) == null
                )
            ) || (  
                Job.Job_Type == 'repair' &&
                (
                    Game.flags[Job.Source_ID] == null ||
                    Job.Complete == true
                )
            ) || (  
                Job.Job_Type == 'heal' &&
                !Game.flags[Job.Source_ID]
            ) || (  
                Job.Job_Type == 'harvest' &&
                !Game.flags[Job.Source_ID]
            )
        ));

        if(job_cleanup.length > 0){
            for(let closed_job in job_cleanup){
                let Job_ID = '' + job_cleanup[closed_job].Source_ID + '-' + job_cleanup[closed_job].Target_ID;

                if(Memory.jobs[Job_ID] != undefined){
                    console.log('Closing job:', Memory.jobs[Job_ID].Job_Type);
                    require('job').closeJob(Job_ID);
                }
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

    unemploy: function(Drone_ID){
        if(!Memory.jobless.includes(Drone_ID)){
            Memory.jobless.push(Drone_ID)
        }
    },

    processUnemployment: function(){
        Memory.jobless = _.filter(Memory.jobless, (job) => job != null);
        
        if(Memory.jobless.length > 0){
            let passes = 10
            if(Memory.jobless.length < passes)
                passes = Memory.jobless.length;
            while(passes != 0){
                Memory.jobless.reverse();
                let unemployed_id = Memory.jobless.pop();
                Memory.jobless.reverse();

                //console.log(unemployed_id, Memory.drones[unemployed_id].Drone_Role)
                if(Game.creeps[unemployed_id] != null){
                    let jobs = _.filter(Memory.jobs,(Job) => Job.Assigned_ID.length < Job.Assigned_Max);
                    //console.log('Open Positions:', jobs.length)
                    if(jobs.length != 0)
                    {
                        switch(Memory.drones[unemployed_id].Drone_Role){
                            case 'transport':
                                if(require('job_route').assign(unemployed_id) == -2)
                                    require('hive_mind').unemploy(unemployed_id);
                                break;
                            case 'harvest':
                                if(require('job_harvest').assign(unemployed_id) == -2)
                                    require('hive_mind').unemploy(unemployed_id);
                                break;
                            case 'build':
                                if(require('job_upgrade').assign(unemployed_id) != 0)
                                    if(require('job_repair').assign(unemployed_id) != 0)
                                        if(require('job_build').assign(unemployed_id) == -2 ){
                                            require('hive_mind').unemploy(unemployed_id);
                                            let spawn = Game.getObjectById(Memory.drones[unemployed_id].Spawn_ID);
                                            Memory.jobs[spawn.id + '-' + spawn.room.controller.id].Assigned_Max += 1;
                                        }
                                break;
                            case 'scout':
                                if(require('job_scout').assign(unemployed_id) != 0)
                                    require('hive_mind').unemploy(unemployed_id);
                                break;
                            case 'heal':
                                if(require('job_heal').assign(unemployed_id) != 0)
                                    require('hive_mind').unemploy(unemployed_id);
                                break;
                        }
                    }
                }
                passes -= 1;
            }
        }

        return Memory.jobless.length;
    },

    processJob: function(Job_ID, job_count){
        if(Memory.jobs[Job_ID] == null){
            //return job_count;
        }
        
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
                if(Memory.jobs[Job_ID] != null){
                    require('job_build').work(Job_ID);
                    job_count['BUILDER'] += Memory.jobs[Job_ID].Assigned_Max;
                }
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
            case 'heal':
                require('job_heal').work(Job_ID);
                job_count['HEAL'] += Memory.jobs[Job_ID].Assigned_Max;
                break;
        };
        return job_count;
    },

    populationControll: function(Nest_ID, job_count){
        let roles = ['transport','harvest','build','scout','heal'];
        for(let role in roles){
            let filtered_drones = _.filter(Memory.drones, (Drone) => Drone.Drone_Role == roles[role]);

            filtered_drones = filtered_drones.concat(_.filter(Memory.nests[Nest_ID].Drone_Queue, (Drone) => Drone.role == roles[role]));
            if(Memory.nests[Nest_ID].Queue_Current.role == roles[role]){
                filtered_drones.push(Memory.nests[Nest_ID].Queue_Current);
            }

            switch(roles[role]){
                case 'transport':
                    if(job_count['TRANSPORTER'] - filtered_drones.length > 0){
                        require('nest_hatchery').queueDrone(Nest_ID, 'transport', {MOVE:2, CARRY:4}, 1.0);
                    }
                    break;
                case 'harvest':
                    if(job_count['HARVESTER'] - filtered_drones.length > 0){
                        require('nest_hatchery').queueDrone(Nest_ID, 'harvest', {MOVE:2, CARRY:1, WORK:5}, 1.0);
                    }
                    break;
                case 'build':
                    if(job_count['UPGRADER'] + Math.floor((job_count['BUILDER'] + job_count['REPAIRER']) / 10) - filtered_drones.length > 0){
                        require('nest_hatchery').queueDrone(Nest_ID, 'build', {WORK:4, MOVE:8, CARRY:4}, 2.3);
                    }
                    break;
                case 'scout':
                    if(job_count['SCOUT'] - filtered_drones.length > 0){
                        require('nest_hatchery').queueDrone(Nest_ID, 'scout', {TOUGH:4, MOVE:8, ATTACK:2}, 2.4);
                    }
                    break;
                case 'heal':
                    if(job_count['HEAL'] - filtered_drones.length > 0){
                        require('nest_hatchery').queueDrone(Nest_ID, 'heal', {MOVE:12, HEAL:10}, 2.5);
                    }
                    break;
            }
        }
    },
};

module.exports = hive_mind;