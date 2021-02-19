var nest = {
    init: function(Entity_ID_A, Entity_ID_B){
        Memory.nests.Nest_ID = '' + Entity_ID_A + '-' + Entity_ID_B;
    }
};

module.exports = nest;