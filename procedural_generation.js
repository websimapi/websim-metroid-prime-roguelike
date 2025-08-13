// Advanced procedural level generation system
class ProceduralGenerator {
    constructor() {
        this.rooms = [];
        this.corridors = [];
        this.enemySpawns = [];
        this.itemSpawns = [];
    }
    
    generateLevel(seed = Date.now()) {
        // Use seed for deterministic generation
        this.rng = this.createRNG(seed);
        
        const level = {
            rooms: this.generateRooms(),
            corridors: this.generateCorridors(),
            enemies: this.generateEnemies(),
            items: this.generateItems(),
            startPosition: { x: 0, y: 0, z: 0 }
        };
        
        return level;
    }
    
    createRNG(seed) {
        return () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }
    
    generateRooms() {
        const rooms = [];
        const numRooms = 5 + Math.floor(this.rng() * 5);
        
        for (let i = 0; i < numRooms; i++) {
            const room = {
                id: i,
                width: 10 + Math.floor(this.rng() * 20),
                height: 10 + Math.floor(this.rng() * 20),
                depth: 10 + Math.floor(this.rng() * 20),
                position: {
                    x: Math.floor(this.rng() * 100) - 50,
                    y: 0,
                    z: Math.floor(this.rng() * 100) - 50
                },
                type: this.getRoomType(),
                connections: []
            };
            
            rooms.push(room);
        }
        
        return rooms;
    }
    
    generateCorridors() {
        const corridors = [];
        
        // Connect rooms with corridors
        for (let i = 0; i < this.rooms.length - 1; i++) {
            const corridor = {
                start: this.rooms[i].position,
                end: this.rooms[i + 1].position,
                width: 3,
                height: 5
            };
            
            corridors.push(corridor);
        }
        
        return corridors;
    }
    
    generateEnemies() {
        const enemies = [];
        const numEnemies = 10 + Math.floor(this.rng() * 10);
        
        for (let i = 0; i < numEnemies; i++) {
            const enemy = {
                type: this.getEnemyType(),
                position: {
                    x: Math.floor(this.rng() * 80) - 40,
                    y: 1,
                    z: Math.floor(this.rng() * 80) - 40
                },
                health: 50 + Math.floor(this.rng() * 50),
                damage: 10 + Math.floor(this.rng() * 20)
            };
            
            enemies.push(enemy);
        }
        
        return enemies;
    }
    
    generateItems() {
        const items = [];
        const itemTypes = ['energy', 'missiles', 'health'];
        
        for (let i = 0; i < 8; i++) {
            const item = {
                type: itemTypes[Math.floor(this.rng() * itemTypes.length)],
                position: {
                    x: Math.floor(this.rng() * 60) - 30,
                    y: 1,
                    z: Math.floor(this.rng() * 60) - 30
                },
                value: 25 + Math.floor(this.rng() * 25)
            };
            
            items.push(item);
        }
        
        return items;
    }
    
    getRoomType() {
        const types = ['combat', 'treasure', 'puzzle', 'boss'];
        return types[Math.floor(this.rng() * types.length)];
    }
    
    getEnemyType() {
        const types = ['space_pirate', 'metroid', 'security_droid'];
        return types[Math.floor(this.rng() * types.length)];
    }
}

export default ProceduralGenerator;

