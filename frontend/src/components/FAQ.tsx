'use client';

import { useState } from 'react';
import { FAQItem } from '@/lib/internal-links';

interface FAQProps {
  items: FAQItem[];
  title?: string;
  variant?: 'accordion' | 'list';
  includeJsonLd?: boolean;
}

export function FAQ({ items, title = 'Frequently Asked Questions', variant = 'accordion', includeJsonLd = true }: FAQProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  // Return null if no items provided
  if (!items || items.length === 0) {
    return null;
  }

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqSchema = includeJsonLd ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  } : null;

  if (variant === 'list') {
    return (
      <section className="faq-section">
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        )}
        
        <h2 className="text-lg font-bold text-ink mb-4">{title}</h2>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="card !p-4">
              <h3 className="font-bold text-ink text-sm mb-2">{item.question}</h3>
              <p className="text-xs text-muted leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="faq-section">
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      
      <h2 className="text-lg font-bold text-ink mb-4">{title}</h2>
      <div className="space-y-3">
        {items.map((item, index) => {
          const isOpen = openItems.has(index);
          
          return (
            <div key={index} className="card !p-0 overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-stone-50/60 transition-colors"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-bold text-ink text-sm pr-4">{item.question}</span>
                <span 
                  className={`text-accent transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                  aria-hidden="true"
                >
                  ▼
                </span>
              </button>
              
              <div
                id={`faq-answer-${index}`}
                className={`overflow-hidden transition-all duration-200 ${
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-4 pb-4 pt-0">
                  <p className="text-xs text-muted leading-relaxed">{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
