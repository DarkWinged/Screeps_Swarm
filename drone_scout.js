var drone = require('drone');
var scout = {
    init: function(Entity_ID_A, Entity_ID_B){
        drone.init(Entity_ID_A, Entity_ID_B)
        Memory.drones[Entity_ID_A].Drone_Role = 'scout';
    }
};

module.exports = scout;