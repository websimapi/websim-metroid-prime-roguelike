// Advanced procedural audio system for atmospheric soundscapes
class AudioEngine {
    constructor(context) {
        this.context = context;
        this.masterGain = context.createGain();
        this.masterGain.connect(context.destination);
        
        this.createAtmosphericAudio();
    }
    
    createAtmosphericAudio() {
        // Create multiple layers of ambient sound
        this.ambientLayers = [];
        
        // Low frequency rumble
        const rumble = this.context.createOscillator();
        const rumbleGain = this.context.createGain();
        rumble.type = 'sine';
        rumble.frequency.setValueAtTime(30, this.context.currentTime);
        rumbleGain.gain.setValueAtTime(0.05, this.context.currentTime);
        
        rumble.connect(rumbleGain);
        rumbleGain.connect(this.masterGain);
        
        // High frequency ambient
        const ambient = this.context.createBufferSource();
        const ambientGain = this.context.createGain();
        
        // Create white noise buffer
        const bufferSize = this.context.sampleRate * 2;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        ambient.buffer = buffer;
        ambient.loop = true;
        ambientGain.gain.setValueAtTime(0.02, this.context.currentTime);
        
        ambient.connect(ambientGain);
        ambientGain.connect(this.masterGain);
        
        this.ambientLayers.push(rumble, ambient);
    }
    
    playCombatMusic() {
        // Dynamic combat music generation
        const melody = this.context.createOscillator();
        const harmony = this.context.createOscillator();
        const rhythm = this.context.createOscillator();
        
        const melodyGain = this.context.createGain();
        const harmonyGain = this.context.createGain();
        const rhythmGain = this.context.createGain();
        
        melody.type = 'sawtooth';
        harmony.type = 'square';
        rhythm.type = 'triangle';
        
        melody.frequency.setValueAtTime(220, this.context.currentTime);
        harmony.frequency.setValueAtTime(110, this.context.currentTime);
        rhythm.frequency.setValueAtTime(55, this.context.currentTime);
        
        melodyGain.gain.setValueAtTime(0.1, this.context.currentTime);
        harmonyGain.gain.setValueAtTime(0.05, this.context.currentTime);
        rhythmGain.gain.setValueAtTime(0.08, this.context.currentTime);
        
        [melody, harmony, rhythm].forEach((osc, i) => {
            osc.frequency.exponentialRampToValueAtTime(
                220 * Math.pow(2, i/12),
                this.context.currentTime + 2
            );
        });
        
        melody.connect(melodyGain);
        harmony.connect(harmonyGain);
        rhythm.connect(rhythmGain);
        
        melodyGain.connect(this.masterGain);
        harmonyGain.connect(this.masterGain);
        rhythmGain.connect(this.masterGain);
        
        melody.start();
        harmony.start();
        rhythm.start();
    }
}

export default AudioEngine;

