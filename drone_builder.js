var drone = require('drone');
var builder = {
    init: function(drone_id, spawn_id){
        drone.init(drone_id, spawn_id)
        Memory.drones[drone_id].Drone_Role = 'build';
        Memory.drones[drone_id].Resupply = true;
    }
};

module.exports = builder;