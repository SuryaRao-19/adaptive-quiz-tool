import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * Resilient Math & STEM Text Renderer
 * Supports mixed plain text and LaTeX:
 * - Inline: $...$ or \(...\)
 * - Block / Display: $$...$$ or \[...\]
 * - Raw LaTeX commands like \frac, \sqrt, \times
 * 
 * Guarantees zero crash on malformed expressions.
 */
export const MathRenderer = ({ 
  content = '', 
  className = '', 
  inline = false,
  tag = 'span' 
}) => {
  const renderedHtml = useMemo(() => {
    if (!content || typeof content !== 'string') {
      return '';
    }

    // Check if string contains math delimiters or common LaTeX commands
    const hasMath = /\$|\\\(|\\\[|\\frac|\\sqrt|\\times|\\div|\\pm|\\le|\\ge|\\pi|\^|_/.test(content);
    if (!hasMath) {
      return content;
    }

    // Strategy: Split by $$...$$ (display math) and $...$ (inline math)
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;
    const parts = content.split(regex);

    return parts.map((part) => {
      if (!part) return '';

      const isDisplay = part.startsWith('$$') && part.endsWith('$$');
      const isAltDisplay = part.startsWith('\\[') && part.endsWith('\\]');
      const isInline = part.startsWith('$') && part.endsWith('$');
      const isAltInline = part.startsWith('\\(') && part.endsWith('\\)');

      if (isDisplay || isAltDisplay) {
        const formula = isDisplay ? part.slice(2, -2) : part.slice(2, -2);
        try {
          return katex.renderToString(formula.trim(), {
            displayMode: true,
            throwOnError: false,
            strict: false
          });
        } catch (e) {
          return formula;
        }
      }

      if (isInline || isAltInline) {
        const formula = isInline ? part.slice(1, -1) : part.slice(2, -2);
        try {
          return katex.renderToString(formula.trim(), {
            displayMode: false,
            throwOnError: false,
            strict: false
          });
        } catch (e) {
          return formula;
        }
      }

      // Check if the plain text segment contains raw un-delimited LaTeX such as \frac{a}{b}
      if (/\\(frac|sqrt|times|approx|pm|le|ge)/.test(part)) {
        try {
          return katex.renderToString(part.trim(), {
            displayMode: false,
            throwOnError: false,
            strict: false
          });
        } catch (e) {
          return part;
        }
      }

      // Plain text segment: escape HTML special characters for safe output
      return part
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }).join('');
  }, [content]);

  const Tag = tag;

  return (
    <Tag 
      className={`math-rendered ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
      aria-label={typeof content === 'string' ? content : undefined}
    />
  );
};
