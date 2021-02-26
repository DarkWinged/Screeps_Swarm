var drone = require('drone');
var scout = {
    init: function(drone_id, spawn_id){
        drone.init(drone_id, spawn_id)
        Memory.drones[drone_id].Drone_Role = 'scout';
    }
};

module.exports = scout;