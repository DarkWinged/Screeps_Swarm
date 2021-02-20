var drone = require('drone');
var builder = {
    init: function(Entity_ID_A, Entity_ID_B){
        drone.init(Entity_ID_A, Entity_ID_B)
        Memory.drones[Entity_ID_A].Drone_Role = 'builder';
    }
};

module.exports = builder;