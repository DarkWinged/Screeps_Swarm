//Legacy Code, only here as a reminder of how far this project has come.
var nest = require('nest');
var extension = {
    init: function(Entity_ID_A, Entity_ID_B){
        nest.init(Entity_ID_A, Entity_ID_B)
    }
};

module.exports = extension;
