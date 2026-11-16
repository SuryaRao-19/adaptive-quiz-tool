/**
 * AdaptIQ 3.0 — Client Web Speech API Text-to-Speech Helper
 * client/src/utils/speechSynthesis.js
 * 
 * Provides accessible audio read-aloud for questions, explanations, and formulas
 * using the browser's built-in, zero-cloud Web Speech API.
 */

class SpeechHelper {
  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    this.currentUtterance = null;
    this.isSpeaking = false;
  }

  speak(text, onEnd) {
    if (!this.isSupported || !text) return;

    // Clean markdown and LaTeX tags for natural speech
    const cleanText = text
      .replace(/\$([^$]+)\$/g, '$1') // remove inline $
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2')
      .replace(/\\times/g, 'times')
      .replace(/\\sqrt\{([^}]+)\}/g, 'square root of $1')
      .replace(/[*_#`]/g, '')
      .trim();

    this.stop();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // Clear pedagogical cadence
    utterance.pitch = 1.0;
    utterance.lang = 'en-IN'; // Indian English cadence for CBSE schools

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (typeof onEnd === 'function') onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
    };

    this.currentUtterance = utterance;
    this.isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }

  stop() {
    if (this.isSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }
}

export const speechHelper = new SpeechHelper();
