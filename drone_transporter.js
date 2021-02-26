var drone = require('drone');
var transporter = {
    init: function(drone_id, spawn_id){
        drone.init(drone_id, spawn_id)
        Memory.drones[drone_id].State = false;
        Memory.drones[drone_id].Drone_Role = 'transport';
    }
};

module.exports = transporter;