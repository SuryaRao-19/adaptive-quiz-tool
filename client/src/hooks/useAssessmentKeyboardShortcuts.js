import { useEffect } from 'react';

/**
 * Reusable Keyboard Navigation Hook for Assessments (Phase 3)
 * 
 * Supports:
 * - 1, 2, 3, 4 or A, B, C, D: Select multiple-choice option
 * - Enter: Check / Submit answer when allowed
 * - Space or ArrowRight: Proceed to next question when feedback is visible
 * 
 * Includes safety guards to prevent conflicts with inputs, modals, and textareas.
 */
export function useAssessmentKeyboardShortcuts({
  optionCount = 4,
  selectedOption = null,
  onSelectOption,
  isAnswerChecked = false,
  onCheckAnswer,
  canCheckAnswer = false,
  onNextQuestion,
  canNextQuestion = false,
  isDisabled = false
}) {
  useEffect(() => {
    if (isDisabled) return;

    const handleKeyDown = (e) => {
      // 1. Guard against triggering inside form fields or editable elements
      const targetTag = e.target.tagName?.toLowerCase();
      if (
        targetTag === 'input' || 
        targetTag === 'textarea' || 
        targetTag === 'select' || 
        e.target.isContentEditable
      ) {
        return;
      }

      // 2. Guard against meta keys (Ctrl, Alt, Meta) to allow OS shortcuts
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const key = e.key;

      // 3. Option Selection: 1-4 or A-D
      if (!isAnswerChecked) {
        let selectedIdx = -1;

        if (key >= '1' && key <= String(optionCount)) {
          selectedIdx = parseInt(key, 10) - 1;
        } else if (['a', 'A'].includes(key) && optionCount >= 1) {
          selectedIdx = 0;
        } else if (['b', 'B'].includes(key) && optionCount >= 2) {
          selectedIdx = 1;
        } else if (['c', 'C'].includes(key) && optionCount >= 3) {
          selectedIdx = 2;
        } else if (['d', 'D'].includes(key) && optionCount >= 4) {
          selectedIdx = 3;
        }

        if (selectedIdx >= 0 && selectedIdx < optionCount && onSelectOption) {
          e.preventDefault();
          onSelectOption(selectedIdx);
          return;
        }
      }

      // 4. Enter to Check Answer
      if (key === 'Enter') {
        if (!isAnswerChecked && canCheckAnswer && onCheckAnswer) {
          e.preventDefault();
          onCheckAnswer();
          return;
        }
      }

      // 5. Space or ArrowRight to Proceed to Next Question
      if ((key === ' ' || key === 'ArrowRight') && isAnswerChecked) {
        if (canNextQuestion && onNextQuestion) {
          e.preventDefault(); // Prevent page scroll on Space
          onNextQuestion();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    optionCount,
    selectedOption,
    onSelectOption,
    isAnswerChecked,
    onCheckAnswer,
    canCheckAnswer,
    onNextQuestion,
    canNextQuestion,
    isDisabled
  ]);
}
