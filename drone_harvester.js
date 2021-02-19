var drone = require('drone');
    //require('drone_harvester').init()
    var harvester = {
        init: function(Entity_ID_A, Entity_ID_B){
            drone.init(Entity_ID_A, Entity_ID_B)
            //Memory.drones[Entity_ID_A].Source_ID = '';
        }
};

module.exports = harvester;