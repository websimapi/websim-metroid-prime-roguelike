import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import nipplejs from 'nipplejs';

class MetroidPrimeRoguelike {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();
        
        this.player = {
            velocity: new THREE.Vector3(),
            speed: 5,
            health: 100,
            energy: 100,
            position: new THREE.Vector3(0, 2, 0)
        };
        
        this.keys = {};
        this.isMobile = window.innerWidth <= 768;
        this.gameStarted = false;
        
        this.rooms = [];
        this.enemies = [];
        this.pickups = [];
        
        this.audio = {
            context: null,
            sounds: {},
            music: null
        };
        
        this.controls = null;
        this.joystick = null;
        
        this.init();
    }
    
    init() {
        this.setupRenderer();
        this.setupLights();
        this.setupControls();
        this.setupAudio();
        this.setupEventListeners();
        this.generateLevel();
        this.setupUI();
        
        if (this.isMobile) {
            this.setupMobileControls();
        }
        
        this.animate();
    }
    
    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('game-container').appendChild(this.renderer.domElement);
    }
    
    setupLights() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0x0f0f0f, 0.5);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }
    
    setupControls() {
        if (!this.isMobile) {
            this.controls = new PointerLockControls(this.camera, document.body);
            this.scene.add(this.controls.getObject());
        }
    }
    
    setupAudio() {
        this.audio.context = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create procedural audio
        this.createAmbientMusic();
        this.createSoundEffects();
    }
    
    createAmbientMusic() {
        const oscillator = this.audio.context.createOscillator();
        const gainNode = this.audio.context.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(55, this.audio.context.currentTime);
        gainNode.gain.setValueAtTime(0.1, this.audio.context.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audio.context.destination);
        
        this.audio.music = { oscillator, gainNode };
    }
    
    createSoundEffects() {
        // Create simple beep sounds for various actions
        this.audio.sounds.shoot = this.createBeepSound(440, 0.1);
        this.audio.sounds.hit = this.createBeepSound(220, 0.2);
        this.audio.sounds.pickup = this.createBeepSound(880, 0.3);
    }
    
    createBeepSound(frequency, duration) {
        return () => {
            const oscillator = this.audio.context.createOscillator();
            const gainNode = this.audio.context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audio.context.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audio.context.currentTime);
            gainNode.gain.setValueAtTime(0.3, this.audio.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audio.context.currentTime + duration);
            
            oscillator.start(this.audio.context.currentTime);
            oscillator.stop(this.audio.context.currentTime + duration);
        };
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('shoot-btn').addEventListener('touchstart', () => {
            this.shoot();
        });
        
        document.getElementById('jump-btn').addEventListener('touchstart', () => {
            this.jump();
        });
    }
    
    setupMobileControls() {
        this.joystick = nipplejs.create({
            zone: document.getElementById('joystick-zone'),
            mode: 'static',
            position: { left: '75px', bottom: '75px' }
        });
        
        // Listen to joystick movement events
        this.joystick.on('move', (evt, data) => {
            // Data is available in the event
        });
    }
    
    generateLevel() {
        // Create procedural rooms
        const roomSize = 20;
        const numRooms = 5;
        
        for (let i = 0; i < numRooms; i++) {
            const room = this.createRoom(roomSize);
            room.position.set(
                (Math.random() - 0.5) * 100,
                0,
                (Math.random() - 0.5) * 100
            );
            this.rooms.push(room);
            this.scene.add(room);
        }
        
        // Generate enemies
        for (let i = 0; i < 10; i++) {
            const enemy = this.createEnemy();
            enemy.position.set(
                (Math.random() - 0.5) * 80,
                1,
                (Math.random() - 0.5) * 80
            );
            this.enemies.push(enemy);
            this.scene.add(enemy);
        }
        
        // Generate pickups
        for (let i = 0; i < 5; i++) {
            const pickup = this.createPickup();
            pickup.position.set(
                (Math.random() - 0.5) * 80,
                1,
                (Math.random() - 0.5) * 80
            );
            this.pickups.push(pickup);
            this.scene.add(pickup);
        }
    }
    
    createRoom(size) {
        const geometry = new THREE.BoxGeometry(size, 10, size);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x111111,
            transparent: true,
            opacity: 0.8
        });
        
        const room = new THREE.Mesh(geometry, material);
        room.receiveShadow = true;
        
        // Add walls
        const wallGeometry = new THREE.BoxGeometry(0.5, 10, size);
        const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x0a0a0a });
        
        const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
        wall1.position.set(size/2, 5, 0);
        room.add(wall1);
        
        const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
        wall2.position.set(-size/2, 5, 0);
        room.add(wall2);
        
        return room;
    }
    
    createEnemy() {
        const geometry = new THREE.SphereGeometry(0.5, 8, 6);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xff0000,
            emissive: 0x330000
        });
        
        const enemy = new THREE.Mesh(geometry, material);
        enemy.castShadow = true;
        enemy.userData = { health: 50, type: 'enemy' };
        
        return enemy;
    }
    
    createPickup() {
        const geometry = new THREE.OctahedronGeometry(0.5);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00,
            emissive: 0x003300
        });
        
        const pickup = new THREE.Mesh(geometry, material);
        pickup.userData = { type: 'pickup', value: 25 };
        
        return pickup;
    }
    
    setupUI() {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingFill = document.getElementById('loading-fill');
        
        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += 5;
            loadingFill.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(loadingInterval);
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 100);
    }
    
    startGame() {
        document.getElementById('menu-screen').style.display = 'none';
        this.gameStarted = true;
        
        if (!this.isMobile && this.controls) {
            this.controls.lock();
        }
        
        // Start ambient music
        if (this.audio.music) {
            this.audio.music.oscillator.start();
        }
    }
    
    update(delta) {
        if (!this.gameStarted) return;
        
        // Update player movement
        if (!this.isMobile && this.controls) {
            this.updateDesktopMovement(delta);
        } else if (this.isMobile && this.joystick) {
            this.updateMobileMovement(delta);
        }
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.rotation.y += delta;
            enemy.position.y = 1 + Math.sin(Date.now() * 0.001) * 0.2;
        });
        
        // Update pickups
        this.pickups.forEach(pickup => {
            pickup.rotation.y += delta * 2;
            pickup.rotation.x += delta;
        });
        
        // Check collisions
        this.checkCollisions();
        
        // Update UI
        this.updateUI();
    }
    
    updateDesktopMovement(delta) {
        const speed = this.player.speed * delta;
        
        if (this.keys['KeyW']) this.player.velocity.z -= speed;
        if (this.keys['KeyS']) this.player.velocity.z += speed;
        if (this.keys['KeyA']) this.player.velocity.x -= speed;
        if (this.keys['KeyD']) this.player.velocity.x += speed;
        
        if (this.keys['Space']) this.jump();
        
        this.controls.getObject().position.x += this.player.velocity.x;
        this.controls.getObject().position.z += this.player.velocity.z;
        
        // Apply friction
        this.player.velocity.multiplyScalar(0.9);
    }
    
    updateMobileMovement(delta) {
        if (this.joystick && this.camera) {
            // Use the joystick's direct position data instead of getData()
            const data = this.joystick;
            if (data.frontPosition) {
                const speed = this.player.speed * delta;
                const x = (data.frontPosition.x - data.position.x) / 75;
                const y = (data.frontPosition.y - data.position.y) / 75;
                
                // Calculate forward/backward based on camera direction
                const forward = new THREE.Vector3();
                this.camera.getWorldDirection(forward);
                forward.y = 0;
                forward.normalize();
                
                const right = new THREE.Vector3();
                right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
                
                this.camera.position.add(forward.multiplyScalar(-y * speed));
                this.camera.position.add(right.multiplyScalar(x * speed));
            }
        }
    }
    
    jump() {
        if (this.controls) {
            this.controls.getObject().position.y += 5 * 0.016;
        } else {
            this.camera.position.y += 5 * 0.016;
        }
    }
    
    shoot() {
        this.audio.sounds.shoot();
        
        // Simple raycasting for shooting
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(), this.camera);
        
        const intersects = raycaster.intersectObjects(this.enemies);
        if (intersects.length > 0) {
            const enemy = intersects[0].object;
            enemy.userData.health -= 25;
            
            if (enemy.userData.health <= 0) {
                this.scene.remove(enemy);
                this.enemies = this.enemies.filter(e => e !== enemy);
            }
            
            this.audio.sounds.hit();
        }
    }
    
    checkCollisions() {
        const playerPos = this.isMobile ? this.camera.position : this.controls.getObject().position;
        
        // Check pickup collisions
        this.pickups.forEach(pickup => {
            const distance = playerPos.distanceTo(pickup.position);
            if (distance < 2) {
                this.player.energy = Math.min(100, this.player.energy + pickup.userData.value);
                this.scene.remove(pickup);
                this.pickups = this.pickups.filter(p => p !== pickup);
                this.audio.sounds.pickup();
            }
        });
    }
    
    updateUI() {
        document.getElementById('health-fill').style.width = `${this.player.health}%`;
        document.getElementById('energy-fill').style.width = `${this.player.energy}%`;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        this.update(delta);
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize game
window.addEventListener('load', () => {
    new MetroidPrimeRoguelike();
});