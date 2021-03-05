var drone = require('drone');
var harvester = {
    //require('drone_harvester').init()
    init: function(drone_id, spawn_id){
        drone.init(drone_id, spawn_id)
        Memory.drones[drone_id].Drone_Role = 'harvest';
    }
};

module.exports = harvester;