var nest = require('nest');
var nest_hatchery = {
    //require('nest_hatchery').init('8c172c4b1d50f789d3f131ec');
    init: function(nest_id){
        nest.init(nest_id);
        Memory.nests[nest_id].Role = 'hatchery';
        Memory.nests[nest_id].Drone_Queue = [];
        Memory.nests[nest_id].Queue_Current = {state: false};
        Memory.nests[nest_id].Current_Cost = 0;
        let spawn = Game.getObjectById(nest_id);
        var sources = spawn.room.find(FIND_SOURCES);
        for(var ESource in sources){
            require('job_harvest').init(nest_id, sources[ESource].id);
            require('nest_hatchery').queue_harvester(nest_id);
            require('nest_hatchery').queue_transporter(nest_id);
            require('nest_hatchery').queue_transporter(nest_id);
        };
        require('job_upgrade').init(nest_id,Game.getObjectById(nest_id).room.controller.id);
        require('job_scout').init(nest_id,'Flag1');
        return nest_id;
    },
    
    work: function(Nest_ID){
        require('nest_hatchery').process_queue(Nest_ID);
    },

    //This needs to be moved into a new class (genome? genewrite? Species?)
    calculate_cost: function(genome, Nest_ID){
        let total_cost = 0;
        
        //constant
        const gene_cost = {MOVE:50,WORK:100,CARRY:50,ATTACK:80,RANGED_ATTACK:150,HEAL:250,CLAIM:600,TOUGH:10};
        
        for(let gene in genome){
            total_cost += (gene_cost[gene]*genome[gene]);
        }
        
        let expansions = Game.getObjectById(Nest_ID).room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION)}
        });
        let expansion_sum = 0;
        for(structure in expansions){
            expansion_sum += expansions[structure].store.getCapacity(RESOURCE_ENERGY);
        }

        if(total_cost > Game.getObjectById(Nest_ID).store.getCapacity(RESOURCE_ENERGY) + expansion_sum) {
            return -1;
        } else {
            return total_cost;
        }
    },

    //This needs to be moved into a new class (genome? genewrite? Species?)
    compose_dna: function(genome){
        let dna = [];
        
        for(let gene in genome){
            for(var w = 0; w < genome[gene]; w++){
                switch(gene){
                    case 'MOVE':
                        dna.push(MOVE);
                        break;
                    case 'WORK':
                        dna.push(WORK);
                        break;
                    case 'CARRY':
                        dna.push(CARRY);
                        break;
                    case 'ATTACK':
                        dna.push(ATTACK);
                        break;
                    case 'RANGED_ATTACK':
                        dna.push(RANGED_ATTACK);
                        break;
                    case 'HEAL':
                        dna.push(HEAL);
                        break;
                    case 'CLAIM':
                        dna.push(CLAIM);
                        break;
                    case 'TOUGH':
                        dna.push(TOUGH);
                        break;
                }
            }
        }
        
        return dna;
    },
    
    grow_drone: function(species, Spawn_ID){
        //utility
        let spawn = Game.getObjectById(Spawn_ID);
        let dna = require('nest_hatchery').compose_dna(species.genome);
        let drone_id = '' + species.s_name + Game.time + 'x' + Math.round(Math.random()*1000) + 'X';
        
        console.log('Spawning new ' + species.s_name + ': ' + drone_id);
        
        spawn.spawnCreep(dna, drone_id);
        switch(species.role){
            case 'harvest':
                require('drone_harvester').init(drone_id, Spawn_ID);
                require('job_route').init(drone_id, Spawn_ID);
                break;
            case 'transport':
                require('drone_transporter').init(drone_id, Spawn_ID);
                break;
            case 'build':
                require('drone_builder').init(drone_id, Spawn_ID);
                break;
            case 'scout':
                require('drone_scout').init(drone_id, Spawn_ID);
                break;
        }
    },
    
    process_queue: function(Nest_ID){
        if(Memory.nests[Nest_ID].Drone_Queue.length != 0 || Memory.nests[Nest_ID].Queue_Current.state != false){
            let spawn = Game.getObjectById(Nest_ID);
            if(!spawn.spawning){
                
                /*Game.map.visual.text(
                    'Energy:' + spawn.store.getUsedCapacity(RESOURCE_ENERGY) + '/' + Memory.nests[Nest_ID].Current_Cost,
                    spawn.room.getPositionAt(spawn.pos.x + 3, spawn.pos.y - 0.25)
                    );*/
                    
                if(Memory.nests[Nest_ID].Queue_Current.state == false){
                    Memory.nests[Nest_ID].Drone_Queue.reverse();
                    Memory.nests[Nest_ID].Queue_Current = Memory.nests[Nest_ID].Drone_Queue.pop();
                    Memory.nests[Nest_ID].Drone_Queue.reverse();
                    Memory.nests[Nest_ID].Current_Cost = require('nest_hatchery').calculate_cost(Memory.nests[Nest_ID].Queue_Current.genome, Nest_ID);
                }
                
                switch(Memory.nests[Nest_ID].Current_Cost){
                    case -1:
                        Memory.nests[Nest_ID].Queue_Current = {state: false};
                        Memory.nests[Nest_ID].Current_Cost = 0;
                        break;
                    default :
                        let expansions = spawn.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_EXTENSION)
                            }
                        });
                        let expansion_sum = 0;
                        for(structure in expansions){
                            expansion_sum += expansions[structure].store.getUsedCapacity(RESOURCE_ENERGY);
                        }
                        let availible_energy = spawn.store.getUsedCapacity(RESOURCE_ENERGY) + expansion_sum;
                        //console.log('availible_energy:', availible_energy);
                        //console.log('Current_Cost:', Memory.nests[Nest_ID].Current_Cost);
                        if(Memory.nests[Nest_ID].Current_Cost <= availible_energy){
                            require('nest_hatchery').grow_drone(Memory.nests[Nest_ID].Queue_Current, Nest_ID);
                            Memory.nests[Nest_ID].Queue_Current = {state: false};
                            Memory.nests[Nest_ID].Current_Cost = 0;
                        }
                        break;
                }
            }
        }
    },
    
    //The following queue functions need to be combined into a single queueDrone: function (ID, Role, (genome? genewrite? Species?))
    queue_harvester: function(Nest_ID){
        Memory.nests[Nest_ID].Drone_Queue.push({s_name: 'harvest', role: 'harvest', genome: {WORK:5, MOVE:2, CARRY:1}});
    },
    
    queue_transporter: function(Nest_ID){
        Memory.nests[Nest_ID].Drone_Queue.push({s_name: 'transport', role: 'transport', genome: {MOVE:2, CARRY:4}});
    },

    queue_builder: function(Nest_ID){
        Memory.nests[Nest_ID].Drone_Queue.push({s_name: 'build', role: 'build', genome: {WORK:2, MOVE:2, CARRY:2}});
    },

    queue_scout: function(Nest_ID){
        Memory.nests[Nest_ID].Drone_Queue.push({s_name: 'scout', role: 'scout', genome: {TOUGH:4, MOVE:4, ATTACK:2}});
    }
};

module.exports = nest_hatchery;
