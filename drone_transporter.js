var drone = require('drone');
var transporter = {
    init: function(Entity_ID_A, Entity_ID_B){
        drone.init(Entity_ID_A, Entity_ID_B)
        Memory.drones[Entity_ID_A].Transport_State = true;
    }
};

module.exports = transporter;