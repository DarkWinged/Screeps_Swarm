var drone = require('drone');
var healer = {
    init: function(drone_id, spawn_id){
        drone.init(drone_id, spawn_id)
        Memory.drones[drone_id].Drone_Role = 'heal';
    }
};

module.exports = healer;