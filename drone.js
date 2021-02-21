var drone = {
    init: function(Entity_ID_A, Entity_ID_B){
        Memory.drones[Entity_ID_A] = {
            Drone_ID: '' + Entity_ID_A,
            Spawn_ID:'' + Entity_ID_B,
            Fitness_Score: 100
        };
    }
};

module.exports = drone;