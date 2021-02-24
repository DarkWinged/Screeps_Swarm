var nest = require('nest');
var nest_tower = {
    init: function(Nest_ID){
        nest.init(Nest_ID);
        Memory.nests[Nest_ID].Role = 'tower';
    },

    work: function(Nest_ID){
        tower = Game.getObjectById(Nest_ID);
        
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile != null && closestHostile != undefined) {
            tower.attack(closestHostile);
        } else {
            let wall = tower.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) &&
                    structure.hits < structure.hitsMax;
                }
            });
            if(wall.length > 0) {
                if(wall.length >= 1){
                    wall = wall.sort((a,b) => (a.hits > b.hits) ? 1 : -1);
                }
                tower.repair(wall[0]);
            }
        }
    },

};

module.exports = nest_tower;
