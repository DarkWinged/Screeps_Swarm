//Legacy Code only here as a reminder
var spawn_queue = {
    
    init: function(spawn){
        
    },
    
    compose_dna: function(genome){
        let creep_cost = 0;
        let dna = [];
        
        //constant
        const gene_cost = {MOVE:50,WORK:100,CARRY:50,ATTACK:80,RANGED_ATTACK:150,HEAL:250,CLAIM:600,TOUGH:10};
        
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
            creep_cost += (gene_cost[gene]*genome[gene]);
        }
        let composition = {total_cost: creep_cost, dna_starnd: dna};
        return composition;
    },
    
    //require('spawn_queue').grow_creep('species_name', 'role', {WORK:1,MOVE:1,CARRY:1}, Game.spawns['Spawn1'])
    grow_creep: function(species, spawn){
        //utility
        let composition = require('spawn_queue').compose_dna(species.genome);
        if(composition.total_cost <= spawn.store.getUsedCapacity(RESOURCE_ENERGY)){
            var newName = '' + species.s_name + Game.time + 'x' + Math.round(Math.random()*1000) + 'X';
            
            console.log('Spawning new ' + species.s_name + ': ' + newName);
            
            spawn.spawnCreep(composition.dna_starnd, newName);
            switch(species.role){
                case 'harvester':
                    require('drone_harvester').init(newName, spawn.id);
                    require('job_harvest').init(newName, spawn.room.find(FIND_SOURCES)[0].id);
                    require('job_route').init(newName, spawn.id);
                    break;
                case 'transporter':
                    require('drone_transporter').init(newName, spawn.id);
                    require('job_route').assign(newName);
                    break;
            }
            return 0;
        } else if(composition.total_cost > spawn.store.getCapacity(RESOURCE_ENERGY)) {
            return -1;
        }
        return composition.total_cost;
    },
    
    //require('spawn_queue').grow_harvester()
    grow_harvester: function(){
        return require('spawn_queue').grow_creep({s_name: 'harvester', role: 'harvester', genome: {WORK:1,MOVE:1,CARRY:1}}, Game.spawns['Spawn1']);
        //let result = require('spawn_queue').grow_creep({s_name: 'harvester', role: 'harvester', genome: {WORK:1,MOVE:1,CARRY:1}}, Game.spawns['Spawn1']);
        //require('drone_harvester').init(result.drone_id, result.spawn_id);
        //require('job_harvest').init(result.drone_id, Game.getObjectById(result.spawn_id).room.find(FIND_SOURCES)[0].id);
        //require('job_route').init(result.drone_id, result.spawn_id);
    },
    
    //require('spawn_queue').grow_transporter()
    grow_transporter: function(){
        return require('spawn_queue').grow_creep({s_name: 'transporter', role: 'transporter', genome: {MOVE:1,CARRY:2}}, Game.spawns['Spawn1']);
        //require('drone_transporter').init(result.drone_id, result.spawn_id);
        //require('job_route').assign(result.drone_id);
    }
};

module.exports = spawn_queue