# Inclusive STEM Accessibility — Offline Text-to-Speech (TTS)

## 1. Overview
AdaptIQ features offline browser-native speech synthesis to ensure students with reading difficulties, visual impairments, or auditory learning preferences can listen to STEM problems and pedagogical feedback without requiring cloud speech APIs.

## 2. Browser-Native Implementation
- Utilizes `window.speechSynthesis` and `SpeechSynthesisUtterance`.
- Operates 100% offline without external network calls or API keys.
- Opt-in by design: never autoplays upon question navigation.
- Speech can be stopped or paused immediately at any time.

## 3. Mathematical & STEM Speech Normalization
Raw LaTeX notation is normalized via `normalizeMathForSpeech()` in `client/src/services/speechService.js`:
- Fractions: `\frac{1}{4}` -> *"one fourth"*, `\frac{a}{b}` -> *"a over b"*
- Powers: `x^2` -> *"x squared"*, `y^3` -> *"y cubed"*, `x^n` -> *"x to the power of n"*
- Roots: `\sqrt{9}` -> *"square root of 9"*, `\sqrt[3]{x}` -> *"cube root of x"*
- Chemical Formulas: `H_2O` -> *"H 2 O"*, `CO_2` -> *"C O 2"*
- Operators: `\times` -> *"times"*, `\div` -> *"divided by"*, `\le` -> *"less than or equal to"*, `\ge` -> *"greater than or equal to"*, `\ne` -> *"is not equal to"*

## 4. UI Components
- Reusable accessible component: `<SpeechButton />` with ARIA labels and visual speaking wave indicator.
- Integrated in:
  - `QuizCard.jsx` (question stem and options)
  - `FeedbackModal.jsx` (explanation, derivation steps, pitfall warnings)
  - `PracticeMode.jsx` (interactive practice)
  - `TestMode.jsx` (active timed test and post-test review)
