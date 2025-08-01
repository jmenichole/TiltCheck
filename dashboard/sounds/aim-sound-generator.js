/**
 * 🔊 AIM Sound Generator
 * Creates classic AIM notification sounds using Web Audio API
 */

class AIMSoundGenerator {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.generateSounds();
            console.log('🎵 AIM sounds generated');
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    generateSounds() {
        // Classic AIM message sound (bloop)
        this.sounds.message = this.createBloopSound();
        
        // Buddy online sound (higher pitch ding)
        this.sounds.buddyOnline = this.createDingSound(800, 0.3);
        
        // Buddy offline sound (lower pitch)
        this.sounds.buddyOffline = this.createDingSound(400, 0.2);
        
        // Door slam for buddy offline
        this.sounds.doorSlam = this.createDoorSlamSound();
        
        // Type sound for incoming messages
        this.sounds.type = this.createTypeSound();
    }

    createBloopSound() {
        const duration = 0.4;
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const envelope = Math.exp(-t * 3);
            const frequency = 400 + (200 * Math.sin(t * 10));
            data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
        }

        return buffer;
    }

    createDingSound(frequency, volume) {
        const duration = 0.6;
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const envelope = Math.exp(-t * 2);
            data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * volume;
        }

        return buffer;
    }

    createDoorSlamSound() {
        const duration = 0.5;
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const envelope = Math.exp(-t * 8);
            const noise = (Math.random() - 0.5) * 2;
            const lowFreq = Math.sin(2 * Math.PI * 60 * t);
            data[i] = (noise * 0.7 + lowFreq * 0.3) * envelope * 0.4;
        }

        return buffer;
    }

    createTypeSound() {
        const duration = 0.1;
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const envelope = Math.exp(-t * 15);
            const click = Math.sin(2 * Math.PI * 1000 * t);
            data[i] = click * envelope * 0.1;
        }

        return buffer;
    }

    playSound(soundName, volume = 1.0) {
        if (!this.audioContext || !this.sounds[soundName]) return;

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = this.sounds[soundName];
        gainNode.gain.value = volume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start();
    }

    // Export sounds as audio files (for backup)
    exportSoundAsWav(soundName) {
        if (!this.sounds[soundName]) return null;

        const buffer = this.sounds[soundName];
        const length = buffer.length;
        const arrayBuffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(arrayBuffer);

        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, this.audioContext.sampleRate, true);
        view.setUint32(28, this.audioContext.sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * 2, true);

        // Convert float samples to 16-bit PCM
        const data = buffer.getChannelData(0);
        let offset = 44;
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, data[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    downloadSound(soundName, filename) {
        const blob = this.exportSoundAsWav(soundName);
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `aim-${soundName}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Create global sound generator
window.aimSoundGenerator = new AIMSoundGenerator();
