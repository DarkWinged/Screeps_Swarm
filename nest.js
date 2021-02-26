var nest = {
    init: function(nest_id){
        Memory.nests[nest_id] = {Nest_ID: nest_id};
        return Memory.nests[nest_id].Nest_ID;
    }
};

module.exports = nest;