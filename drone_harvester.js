var drone = require('drone');
var harvester = {
    //require('drone_harvester').init()
    init: function(Entity_ID_A, Entity_ID_B){
        drone.init(Entity_ID_A, Entity_ID_B)
        Memory.drones[Entity_ID_A].Drone_Role = 'harvester';
    }
};

module.exports = harvester;