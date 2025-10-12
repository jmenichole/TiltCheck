/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * 
 * This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
 * For licensing information, see LICENSE file in the root directory.
 */

// Audio utility for TiltCheck sounds
// Includes the legendary redeem alert.wav by Discord user blackjackson

class SoundManager {
  constructor() {
    this.sounds = {
      redeemAlert: '/audio/redeem-alert.wav',
      tiltWarning: '/audio/tilt-warning.wav',
      interventionSuccess: '/audio/intervention-success.wav',
      notification: '/audio/notification.wav'
    };
    
    this.audioContext = null;
    this.audioBuffers = new Map();
    this.isEnabled = true;
    
    // Initialize audio context on first user interaction
    this.initializeAudioContext();
  }

  initializeAudioContext() {
    // Modern browsers require user interaction before audio context
    const initAudio = () => {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.preloadSounds();
      }
      
      // Remove the event listener after first interaction
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };

    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
    document.addEventListener('touchstart', initAudio);
  }

  async preloadSounds() {
    try {
      for (const [name, path] of Object.entries(this.sounds)) {
        await this.loadSound(name, path);
      }
      console.log('🔊 All TiltCheck sounds loaded successfully!');
      console.log('🎉 Special thanks to blackjackson for the redeem alert sound!');
    } catch (error) {
      console.warn('Failed to preload some sounds:', error);
    }
  }

  async loadSound(name, path) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load sound: ${path}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(name, audioBuffer);
      
      console.log(`✅ Loaded sound: ${name} (${path})`);
    } catch (error) {
      console.warn(`Failed to load sound ${name}:`, error);
      // Fallback to HTML5 Audio for problematic files
      this.audioBuffers.set(name, path);
    }
  }

  playSound(soundName, volume = 0.7) {
    if (!this.isEnabled) {
      console.log('🔇 Sound disabled, skipping:', soundName);
      return;
    }

    const buffer = this.audioBuffers.get(soundName);
    if (!buffer) {
      console.warn('Sound not loaded:', soundName);
      return;
    }

    try {
      if (typeof buffer === 'string') {
        // Fallback to HTML5 Audio
        this.playHTML5Audio(buffer, volume);
      } else {
        // Use Web Audio API for better performance
        this.playWebAudio(buffer, volume);
      }
    } catch (error) {
      console.warn('Error playing sound:', error);
      // Final fallback
      this.playHTML5Audio(this.sounds[soundName], volume);
    }
  }

  playWebAudio(buffer, volume) {
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start(0);
  }

  playHTML5Audio(src, volume) {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(e => console.warn('HTML5 audio play failed:', e));
  }

  // Specific sound methods with degen flair
  playRedeemAlert(volume = 0.8) {
    console.log('🎉 HECK YEAH! Playing redeem alert by blackjackson!');
    this.playSound('redeemAlert', volume);
  }

  playTiltWarning(volume = 0.6) {
    console.log('⚠️ Tilt warning sound');
    this.playSound('tiltWarning', volume);
  }

  playInterventionSuccess(volume = 0.7) {
    console.log('✅ Intervention success sound');
    this.playSound('interventionSuccess', volume);
  }

  playNotification(volume = 0.5) {
    console.log('🔔 Notification sound');
    this.playSound('notification', volume);
  }

  // Volume and settings
  setEnabled(enabled) {
    this.isEnabled = enabled;
    localStorage.setItem('tiltcheck_sound_enabled', enabled);
    console.log(`🔊 Sound ${enabled ? 'enabled' : 'disabled'}`);
  }

  getEnabled() {
    const stored = localStorage.getItem('tiltcheck_sound_enabled');
    return stored !== null ? stored === 'true' : true;
  }

  // Initialize from localStorage
  initializeSettings() {
    this.isEnabled = this.getEnabled();
  }

  // For testing - play all sounds
  testAllSounds() {
    console.log('🎵 Testing all TiltCheck sounds...');
    
    setTimeout(() => this.playRedeemAlert(), 0);
    setTimeout(() => this.playTiltWarning(), 1000);
    setTimeout(() => this.playInterventionSuccess(), 2000);
    setTimeout(() => this.playNotification(), 3000);
    
    console.log('🎉 Sound test complete! Thanks again to blackjackson for the redeem alert!');
  }
}

// Create singleton instance
const soundManager = new SoundManager();

// Initialize settings from localStorage
soundManager.initializeSettings();

// Export for use in components
export default soundManager;

// Also make it available globally for debugging
if (typeof window !== 'undefined') {
  window.TiltCheckSounds = soundManager;
  console.log('🔊 TiltCheck Sound Manager loaded!');
  console.log('💡 Try: TiltCheckSounds.testAllSounds()');
  console.log('🎉 Special thanks to blackjackson for the redeem alert sound!');
}