/**
 * Web Speech API Audio & Voice Service for ThermoGuard
 * Supports major Indian regional languages with speech rate optimization,
 * native voice auto-selection, pause/resume, and event callbacks.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'hi-IN', lang: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te-IN', lang: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta-IN', lang: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'bn-IN', lang: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr-IN', lang: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'kn-IN', lang: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'gu-IN', lang: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'en-IN', lang: 'en', name: 'English', nativeName: 'English (IN)', flag: '🌐' },
];

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.isPlaying = false;
    this.activeId = null;
    this.voices = [];
    this.listeners = new Set();

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices() || [];
  }

  isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyState(state) {
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (e) {
        console.error('Error notifying speech listener:', e);
      }
    });
  }

  getBestVoiceForLanguage(langCode) {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }
    const shortCode = langCode.split('-')[0].toLowerCase();
    
    // 1. Exact match (e.g. 'hi-IN')
    let matched = this.voices.find(
      (v) => v.lang && v.lang.toLowerCase().replace('_', '-') === langCode.toLowerCase()
    );
    if (matched) return matched;

    // 2. Language prefix match (e.g. 'hi')
    matched = this.voices.find(
      (v) => v.lang && v.lang.toLowerCase().startsWith(shortCode)
    );
    if (matched) return matched;

    // 3. Indian English fallback if lang is English or Indian
    if (shortCode === 'en' || shortCode === 'hi') {
      matched = this.voices.find(
        (v) => v.lang && (v.lang.includes('IN') || v.name.toLowerCase().includes('india'))
      );
      if (matched) return matched;
    }

    return null;
  }

  speak(text, langCode = 'hi-IN', id = 'general', onEndCallback = null) {
    if (!this.isSupported() || !text) {
      if (onEndCallback) onEndCallback();
      return;
    }

    // Cancel any ongoing speech
    this.stop();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.95; // Clear announcement pace
      utterance.pitch = 1.0;

      const voice = this.getBestVoiceForLanguage(langCode);
      if (voice) {
        utterance.voice = voice;
      }

      this.currentUtterance = utterance;
      this.isPlaying = true;
      this.activeId = id;
      this.notifyState({ isPlaying: true, activeId: id, langCode });

      utterance.onend = () => {
        this.isPlaying = false;
        this.activeId = null;
        this.currentUtterance = null;
        this.notifyState({ isPlaying: false, activeId: null, langCode });
        if (onEndCallback) onEndCallback();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis playback ended or was interrupted:', e);
        this.isPlaying = false;
        this.activeId = null;
        this.currentUtterance = null;
        this.notifyState({ isPlaying: false, activeId: null, langCode });
        if (onEndCallback) onEndCallback();
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis error:', err);
      this.isPlaying = false;
      this.activeId = null;
      this.notifyState({ isPlaying: false, activeId: null, langCode });
      if (onEndCallback) onEndCallback();
    }
  }

  stop() {
    if (!this.synth) return;
    try {
      this.synth.cancel();
    } catch (err) {
      console.error('Error cancelling speech:', err);
    }
    this.isPlaying = false;
    this.activeId = null;
    this.currentUtterance = null;
    this.notifyState({ isPlaying: false, activeId: null });
  }

  pause() {
    if (this.synth && this.isPlaying) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }
}

export const speechService = new SpeechService();
