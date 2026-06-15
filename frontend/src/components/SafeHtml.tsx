'use client';

import React, { useEffect, useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface SafeHtmlProps {
  content: string;
  className?: string;
}

export const SafeHtml: React.FC<SafeHtmlProps> = ({ content, className = '' }) => {
  const [sanitizedHtml, setSanitizedHtml] = useState<string>('');
  const [isHtml, setIsHtml] = useState<boolean>(false);

  useEffect(() => {
    if (!content) {
      setSanitizedHtml('');
      setIsHtml(false);
      return;
    }

    // Check if content looks like HTML
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);
    setIsHtml(hasHtmlTags);

    if (hasHtmlTags) {
      // Configure DOMPurify to allow specific tags and attributes for tables
      const cleanHtml = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
          'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style', 'colspan', 'rowspan']
      });

      // Inject table wrapper if not present, to support responsive scrolling
      // Also ensure the table has our custom styling class
      const wrappedHtml = cleanHtml.replace(
        /<table([^>]*)>/g,
        (match, attr) => {
          if (!attr.includes('class="sp-table"')) {
            const newAttr = attr.replace(/class="[^"]*"/, '') + ' class="sp-table"';
            return `<div class="sp-table-wrapper"><table${newAttr}>`;
          }
          return `<div class="sp-table-wrapper">${match}`;
        }
      ).replace(/<\/table>/g, '</table></div>');

      setSanitizedHtml(wrappedHtml);
    } else {
      setSanitizedHtml(content);
    }
  }, [content]);

  if (!content) return null;

  return (
    <div 
      className={`prose-custom text-sm leading-relaxed text-ink/90 ${!isHtml ? 'whitespace-pre-line' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: isHtml ? sanitizedHtml : content }}
    />
  );
};
