import React from 'react';
import sanitizeHtml from 'sanitize-html';

interface SafeHtmlProps {
  content: string;
  className?: string;
}

export const SafeHtml: React.FC<SafeHtmlProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Check if content looks like HTML
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);
  const isHtml = hasHtmlTags;

  let sanitizedHtml = content;

  if (hasHtmlTags) {
    // Configure sanitize-html to allow specific tags and attributes for tables
    const cleanHtml = sanitizeHtml(content, {
      allowedTags: [
        'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
      ],
      allowedAttributes: {
        'a': ['href', 'target', 'rel'],
        'table': ['class', 'style'],
        'td': ['colspan', 'rowspan', 'class', 'style'],
        'th': ['colspan', 'rowspan', 'class', 'style'],
        'div': ['class', 'style'],
        'span': ['class', 'style']
      },
      allowedSchemes: ['http', 'https', 'mailto'],
    });

    // Inject table wrapper if not present, to support responsive scrolling
    // Also ensure the table has our custom styling class
    sanitizedHtml = cleanHtml.replace(
      /<table([^>]*)>/g,
      (match, attr) => {
        if (!attr.includes('class="sp-table"')) {
          const newAttr = attr.replace(/class="[^"]*"/, '') + ' class="sp-table"';
          return `<div class="sp-table-wrapper"><table${newAttr}>`;
        }
        return `<div class="sp-table-wrapper">${match}`;
      }
    ).replace(/<\/table>/g, '</table></div>');
  }

  return (
    <div 
      className={`prose-custom text-sm leading-relaxed text-ink/90 ${!isHtml ? 'whitespace-pre-line' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: isHtml ? sanitizedHtml : content }}
    />
  );
};
