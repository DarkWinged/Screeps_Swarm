var spawn_queue = {
    
    init: function(spawn){
        
    },
    //require('spawn_queue').grow_creep('species_name', 'role', {WORK:1,MOVE:1,CARRY:1}, Game.spawns['Spawn1'])
    grow_creep: function(species_name, role, genome, spawn){
        //utility
        let creep_cost = 0;
        let dna = [];
        
        //constant
        const gene_cost = {MOVE:50,WORK:100,CARRY:50,ATTACK:80,RANGED_ATTACK:150,HEAL:250,CLAIM:600,TOUGH:10};
        
        for(let gene in genome){
            for(var w = 0; w < genome[gene]; w++){
                console.log(gene);
                dna.length ++;
                
                switch(gene){
                    case 'MOVE':
                        dna[dna.length-1] = MOVE;
                        break;
                    case 'WORK':
                        dna[dna.length-1] = WORK;
                        break;
                    case 'CARRY':
                        dna[dna.length-1] = CARRY;
                        break;
                    case 'ATTACK':
                        dna[dna.length-1] = ATTACK;
                        break;
                    case 'RANGED_ATTACK':
                        dna[dna.length-1] = RANGED_ATTACK;
                        break;
                    case 'HEAL':
                        dna[dna.length-1] = HEAL;
                        break;
                    case 'CLAIM':
                        dna[dna.length-1] = CLAIM;
                        break;
                    case 'TOUGH':
                        dna[dna.length-1] = TOUGH;
                        break;
                }
                
            }
            creep_cost = (gene_cost[gene]*genome[gene]);
        }
        console.log(dna);
        
        var newName = '' + species_name + Game.time + 'x' + Math.round(Math.random()*1000) + 'X';
        console.log('Spawning new ' + species_name + ': ' + newName);
            spawn.spawnCreep(dna, newName);
        return {drone_id: newName, spawn_id: spawn.id};
    },
    //require('spawn_queue').grow_harvester()
    grow_harvester: function(){
        let result = require('spawn_queue').grow_creep('harvester', 'role', {WORK:1,MOVE:1,CARRY:1}, Game.spawns['Spawn1']);
        require('drone_harvester').init(result.drone_id, result.spawn_id);
        require('job_harvest').init(result.drone_id, Game.getObjectById(result.spawn_id).room.find(FIND_SOURCES)[0].id);
        require('job_route').init(result.drone_id, result.spawn_id);
    },
    //require('spawn_queue').grow_transporter()
    grow_transporter: function(){
        let result = require('spawn_queue').grow_creep('transporter', 'role', {MOVE:1,CARRY:2}, Game.spawns['Spawn1']);
        require('drone_transporter').init(result.drone_id, result.spawn_id);
        require('job_route').assign(result.drone_id);
    }
};

module.exports = spawn_queue