var nest = {
    init: function(Entity_ID){
        Memory.nests[Entity_ID] = {Nest_ID: '' + Entity_ID};
    }
};

module.exports = nest;