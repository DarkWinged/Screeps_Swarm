var job = require('job');
var job_scout = {
    //require('job_harvest').init('drone_id','source_id')
    init: function(Source_ID, Target_ID){
        let Job_ID = job.init(Source_ID, Target_ID);
        Memory.jobs[Job_ID].Job_Type = 'scout';
        Memory.jobs[Job_ID].Assigned_Max = 10;
        return Job_ID;
    },
    
    //This needs to be broken up into several small functions
    work: function(Job_ID){
        for(let drone in Memory.jobs[Job_ID].Assigned_ID){
            creep = Game.creeps[Memory.jobs[Job_ID].Assigned_ID[drone]];

            if(creep){
                let flag = Game.flags[Memory.jobs[Job_ID].Target_ID];

                if(flag != undefined){
                    if(creep.room != flag.room) {
                        creep.moveTo(flag, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                    else{
                        const found = flag.pos.findClosestByRange(FIND_STRUCTURES, {
                             filter: function(structure) {
                                if(
                                    structure.structureType != STRUCTURE_ROAD &&
                                    (
                                        structure.pos.x == flag.pos.x &&
                                        structure.pos.y == flag.pos.y
                                    )
                                ){
                                    return structure;
                                }
                            }
                        });
                        if(found != null && found != undefined) {
                            if(creep.attack(found) == ERR_NOT_IN_RANGE){
                                creep.moveTo(found, {visualizePathStyle: {stroke: '#ffaa00'}});
                            }
                        } else {
                            var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

                            if(closestHostile != null && closestHostile != undefined) {
                                if(creep.attack(closestHostile) == ERR_NOT_IN_RANGE){
                                    creep.moveTo(closestHostile, {visualizePathStyle: {stroke: '#ffaa00'}});
                                }
                            } else {
                                let closestHostile = flag.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
                                    filter: function(structure) {
                                        if(
                                           structure.structureType != STRUCTURE_ROAD &&
                                        structure.structureType != STRUCTURE_CONTROLLER
                                        ){
                                           return structure;
                                        }
                                    }
                                });

                                if(closestHostile != null && closestHostile != undefined){
                                    if(creep.attack(closestHostile) == ERR_NOT_IN_RANGE){
                                        creep.moveTo(closestHostile, {visualizePathStyle: {stroke: '#ffaa00'}});
                                    } else if (creep.moveTo(closestHostile, {visualizePathStyle: {stroke: '#ffaa00'}}) == ERR_NO_PATH) { 
                                        let closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
                                            filter: function(structure) {
                                                if(
                                                    structure.structureType != STRUCTURE_ROAD &&
                                                    structure.structureType != STRUCTURE_CONTROLLER
                                                ){
                                                    return structure;
                                                }
                                            }
                                        });

                                        if(creep.attack(closestHostile) == ERR_NOT_IN_RANGE){
                                            creep.moveTo(closestHostile, {visualizePathStyle: {stroke: '#ffaa00'}});
                                        }
                                    }
                                }else if(creep.pos != flag.pos){
                                    creep.moveTo(flag, {visualizePathStyle: {stroke: '#ffaa00'}});
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    
    assign: function(Drone_ID){
        return job.assign(Drone_ID, Memory.drones[Drone_ID].Drone_Role);
    },

    close_job: function(Job_ID){
        job.close_job(Job_ID);
    }
      
};

module.exports = job_scout;