# Keyboard-Driven Assessment Flow & Shortcut Directives

## 1. Overview
School computer labs frequently rely on physical keyboards and mice with varying hardware reliability. AdaptIQ provides complete, accessible keyboard navigation for all assessment flows without mouse dependency.

## 2. Standardized Shortcuts
- `1`, `2`, `3`, `4`: Select multiple-choice option A, B, C, or D.
- `A`, `B`, `C`, `D`: Alternative option selectors.
- `Enter`: Verify/Check answer (when an option is selected) or advance when test is ready.
- `Space` or `ArrowRight`: Proceed to next question (only when feedback is visible).

## 3. Conflict Prevention & Safety Guards
The reusable hook `useAssessmentKeyboardShortcuts` implements strict guards:
- **Form Focus Guard**: Ignored when cursor is inside `<input>`, `<textarea>`, `<select>`, or `isContentEditable` elements.
- **Modifier Key Bypass**: Ignored when `ctrlKey`, `altKey`, or `metaKey` is pressed, ensuring standard browser shortcuts (refresh, zoom, inspect) remain functional.
- **Scroll Prevention**: Prevents default page scroll on `Space` specifically when advancing questions.
- **Assessment Integrity**: Shortcuts respect the active state machine; users cannot bypass cooldowns, double-submit, or access answers via shortcuts.

## 4. Visual Badging
Each multiple-choice option button renders a compact desktop key badge (`1`, `2`, `3`, `4`), providing clear visual guidance while hiding on narrow mobile touchscreens.
