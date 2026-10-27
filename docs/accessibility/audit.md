# AdaptIQ Accessibility & Inclusion Audit (WCAG 2.2 AA)

## 1. Compliance Target
AdaptIQ targets full WCAG 2.2 Level AA compliance to ensure students with visual, motor, or cognitive impairments can learn effectively on school computers and mobile devices.

## 2. Key Accessibility Implementations

### 2.1 Touch Targets & Sizing (WCAG 2.5.8)
- All primary interactive elements, answer option buttons, and navigation controls enforce a minimum touch target size of **48 x 48 CSS pixels** (`min-h-[48px]`, `min-h-[58px]`).
- Ample touch padding prevents accidental mis-taps on touchscreens.

### 2.2 Contrast & Six-Theme Consistency (WCAG 1.4.3 & 1.4.11)
- Contrast ratios exceed 4.5:1 for standard body text and 3:1 for large headers and interactive borders.
- Supported themes:
  1. `Student Indigo` (Light, balanced contrast)
  2. `Student Neon Cyber Arcade` (High visual energy with verified contrast)
  3. `Teacher Academic Navy` (Clean editorial layout)
  4. `Teacher Emerald Analytics` (Focused analytical clarity)
  5. `Sunset Warmth` (Reduced blue light for evening study)
  6. `Cyber Midnight` (OLED dark mode for low-light school environments)

### 2.3 Focus Visibility & Keyboard Navigation (WCAG 2.4.7 & 2.1.1)
- High-contrast 2px focus ring (`focus-ring` utility with 2px offset) clearly indicates active element across all themes.
- Logical tab ordering across question cards, option lists, and modal dialogues with keyboard trap prevention.
- Answer options use accessible ARIA attributes (`role="radiogroup"`, `role="radio"`, `aria-checked`).

### 2.4 Motion & Sensory Sensitivity (WCAG 2.3.3)
- Global CSS rule `@media (prefers-reduced-motion: reduce)` zeroes out CSS animation and transition durations.
- Canvas Confetti checks `window.matchMedia('(prefers-reduced-motion: reduce)')` prior to triggering particle bursts.

### 2.5 Resilient Mathematical Notation (KaTeX)
- Mathematical expressions are rendered using KaTeX with inline and display equations.
- In case of invalid or malformed LaTeX syntax, `MathRenderer` catches errors gracefully, rendering legible plain text fallback without crashing the quiz interface.
