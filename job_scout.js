var job = require('job');
var job_scout = {
    //require('job_harvest').init('drone_id','source_id')
    init: function(Source_ID, Target_ID){
        job.init(Source_ID, Target_ID);
        let Job_ID = '' + Source_ID + '-' + Target_ID;
        Memory.jobs[Job_ID].Job_Type = 'scout';
        Memory.jobs[Job_ID].Assigned_Max = 1;
    },
    
    work: function(Job_ID){
        for(let drone in Memory.jobs[Job_ID].Assigned_ID){
            if(Game.creeps[Memory.jobs[Job_ID].Assigned_ID[drone]]){
                let flag = Game.flags[Memory.jobs[Job_ID].Target_ID];
                let creep = Game.creeps[Memory.jobs[Job_ID].Assigned_ID[drone]];
                //creep.say(flag.name);
                //console.log(flag.pos +','+creep.pos);
                if(flag != undefined){
                    if(creep.room != flag.room) {
                        
                        creep.moveTo(flag, {visualizePathStyle: {stroke: '#ffaa00'}});
                        const found = creep.room.lookForAt(LOOK_STRUCTURES, flag.pos);
                        //console.log(found[0]);
                        if(found.length>0) {
                            creep.attack(found[0]);
                        }
                        
                        //console.log(flag.pos);
                    }
                    else{
                        
                        var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                        if(closestHostile != null && closestHostile != undefined) {
                            if(creep.attack(closestHostile) == ERR_NOT_IN_RANGE){
                                creep.moveTo(closestHostile, {visualizePathStyle: {stroke: '#ffaa00'}});
                            }
                        }
                        
                        
                        const found = creep.room.lookForAt(LOOK_STRUCTURES, flag.pos);
                        //console.log(found[0]);
                        if(found.length>0) {
                            if(creep.attack(found[0]) == ERR_NOT_IN_RANGE){
                                creep.moveTo(flag, {visualizePathStyle: {stroke: '#ffaa00'}});
                            }
                        }
                        else if(creep.pos.x != flag.pos.x || creep.pos.y != flag.pos.y){
                            creep.moveTo(flag, {visualizePathStyle: {stroke: '#ffaa00'}});
                        }
                        return false;
                    }
                    return false;
                }
                else
                {
                    return true;
                }
            }
        }
    },

    assign: function(Drone_ID){
        //let creep = Game.creeps[Drone_ID];
        //console.log(creep);
        let jobs = _.filter(Memory.jobs, (Job) => Job.Job_Type == 'scout');
        for(var job in jobs){
            let Job_ID = '' + jobs[job].Source_ID + '-' + jobs[job].Target_ID;
            if(Memory.jobs[Job_ID].Assigned_ID.length < Memory.jobs[Job_ID].Assigned_Max){
                Memory.jobs[Job_ID].Assigned_ID.push(Drone_ID);
                console.log('New assignment:', Drone_ID, 'at', Job_ID);
                return true;
            }
        }
        return false;
    },

    close_job: function(Job_ID){
        job.close_job(Job_ID);
    }
      
};

module.exports = job_scout;