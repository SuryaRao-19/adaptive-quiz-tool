/**
 * AdaptIQ Offline STEM Text-to-Speech (TTS) Engine (Phase 2)
 * 
 * Leverages browser-native window.speechSynthesis to provide 100% offline,
 * zero-bandwidth voice read-aloud for students in Grades 5–10.
 * Includes a dedicated LaTeX / scientific notation speech normalizer.
 */

/**
 * Normalizes mathematical and scientific expressions for clear spoken narration.
 * Converts LaTeX notation, fractions, powers, and equations into natural spoken English.
 * 
 * @param {string} text - Raw input string with optional LaTeX ($...$, \frac, etc.)
 * @returns {string} Natural speech text
 */
export function normalizeMathForSpeech(text) {
  if (!text || typeof text !== 'string') return '';

  let speech = text;

  // 1. Remove enclosing delimiters like $$...$$ or $...$
  speech = speech.replace(/\$\$(.*?)\$\$/g, '$1');
  speech = speech.replace(/\$(.*?)\$/g, '$1');

  // 2. Fractions: \frac{a}{b} -> "a over b"
  speech = speech.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (match, num, den) => {
    const cleanNum = num.trim();
    const cleanDen = den.trim();
    if (cleanNum === '1' && cleanDen === '2') return 'one half';
    if (cleanNum === '1' && cleanDen === '3') return 'one third';
    if (cleanNum === '1' && cleanDen === '4') return 'one fourth';
    if (cleanNum === '3' && cleanDen === '4') return 'three fourths';
    return `${cleanNum} over ${cleanDen}`;
  });

  // 3. Roots: \sqrt{x} -> "square root of x"
  speech = speech.replace(/\\sqrt\{([^}]+)\}/g, 'square root of $1');
  speech = speech.replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1 root of $2');

  // 4. Powers & Exponents: x^2 -> "x squared", x^3 -> "x cubed", x^n -> "x to the power of n"
  speech = speech.replace(/([a-zA-Z0-9]+)\^2(?![0-9])/g, '$1 squared');
  speech = speech.replace(/([a-zA-Z0-9]+)\^3(?![0-9])/g, '$1 cubed');
  speech = speech.replace(/([a-zA-Z0-9]+)\^\{([^}]+)\}/g, '$1 to the power of $2');
  speech = speech.replace(/([a-zA-Z0-9]+)\^([a-zA-Z0-9]+)/g, '$1 to the power of $2');

  // 5. Subscripts: x_1 -> "x subscript 1"
  speech = speech.replace(/([a-zA-Z])_\{([^}]+)\}/g, '$1 subscript $2');
  speech = speech.replace(/([a-zA-Z])_([0-9a-zA-Z])/g, '$1 subscript $2');

  // 6. Common Mathematical Operators & Symbols
  speech = speech.replace(/\\times|\\cdot|\*/g, ' times ');
  speech = speech.replace(/\\div/g, ' divided by ');
  speech = speech.replace(/\\pm/g, ' plus or minus ');
  speech = speech.replace(/\\approx/g, ' is approximately equal to ');
  speech = speech.replace(/\\neq/g, ' does not equal ');
  speech = speech.replace(/\\le|\\leq/g, ' is less than or equal to ');
  speech = speech.replace(/\\ge|\\geq/g, ' is greater than or equal to ');
  speech = speech.replace(/\\infty/g, ' infinity ');
  speech = speech.replace(/\\pi/g, ' pi ');
  speech = speech.replace(/\\theta/g, ' theta ');
  speech = speech.replace(/\\degree/g, ' degrees ');

  // 7. Chemical formulas common in Middle School Science (CO2, H2O, O2)
  speech = speech.replace(/\bH_?2O\b/g, 'H 2 O water');
  speech = speech.replace(/\bCO_?2\b/g, 'C O 2 carbon dioxide');
  speech = speech.replace(/\bO_?2\b/g, 'oxygen O 2');

  // 8. Clean up leftover backslashes and excessive whitespace
  speech = speech.replace(/\\[a-zA-Z]+/g, ' ');
  speech = speech.replace(/[{}()\[\]]/g, ' ');
  speech = speech.replace(/\s+/g, ' ').trim();

  return speech;
}

/**
 * Checks if the current client browser supports Speech Synthesis.
 * @returns {boolean}
 */
export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Cancels any currently speaking utterance.
 */
export function stopSpeech() {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('Speech cancellation error:', e);
    }
  }
}

/**
 * Speaks text using normalized mathematical phrasing.
 * 
 * @param {string} text - The text to be spoken
 * @param {object} [options]
 * @param {number} [options.rate=0.92] - Speech rate (slightly reduced for young learners)
 * @param {number} [options.pitch=1.0] - Voice pitch
 * @param {Function} [options.onStart] - Callback when speech starts
 * @param {Function} [options.onEnd] - Callback when speech concludes
 * @param {Function} [options.onError] - Callback on error
 * @returns {boolean} Success status
 */
export function speakSTEMContent(text, options = {}) {
  if (!isSpeechSupported()) {
    if (options.onError) options.onError(new Error('SpeechSynthesis not supported in this browser'));
    return false;
  }

  // Cancel prior speech immediately to prevent overlap
  stopSpeech();

  const spokenText = normalizeMathForSpeech(text);
  if (!spokenText) return false;

  const utterance = new SpeechSynthesisUtterance(spokenText);
  utterance.rate = options.rate || 0.92;
  utterance.pitch = options.pitch || 1.0;

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  // Select an appropriate English voice if available
  const voices = window.speechSynthesis.getVoices();
  const naturalEnglishVoice = voices.find(v => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.default)));
  if (naturalEnglishVoice) {
    utterance.voice = naturalEnglishVoice;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}
