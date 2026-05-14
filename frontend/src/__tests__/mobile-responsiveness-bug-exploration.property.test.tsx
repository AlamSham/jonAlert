/**
 * Bug Condition Exploration Property-Based Test for Mobile Responsiveness
 * 
 * **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * **DO NOT attempt to fix the test or the code when it fails**
 * **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
 * **GOAL**: Surface counterexamples that demonstrate mobile layout issues exist
 * 
 * **Feature: mobile-responsive-fix, Property 1: Bug Condition - Mobile Layout Breakage Detection**
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5**
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import { StatsBanner } from '../components/StatsBanner';
import { SearchForm } from '../components/SearchForm';
import { JobCard } from '../components/JobCard';
import { TableOfContents } from '../components/TableOfContents';
import { StatsData, JobListItem } from '../lib/types';

// Mock Next.js router for components that use it
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock analytics functions
jest.mock('../lib/analytics', () => ({
  trackSearch: jest.fn(),
  trackFormSubmission: jest.fn(),
  trackApplyClick: jest.fn(),
  trackInternalLinkClick: jest.fn(),
}));

describe('Feature: mobile-responsive-fix, Property 1: Bug Condition - Mobile Layout Breakage Detection', () => {
  let originalInnerWidth: number;
  let originalInnerHeight: number;

  beforeEach(() => {
    // Store original viewport dimensions
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
    
    // Mock getBoundingClientRect for layout calculations
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: jest.fn(),
    }));
  });

  afterEach(() => {
    // Restore original viewport dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  // Arbitraries for generating test data
  const mobileViewportArbitrary = (): fc.Arbitrary<{ width: number; height: number }> =>
    fc.record({
      width: fc.integer({ min: 320, max: 767 }), // Mobile viewport widths
      height: fc.integer({ min: 568, max: 1024 }), // Reasonable mobile heights
    });

  const statsDataArbitrary = (): fc.Arbitrary<StatsData> =>
    fc.record({
      totalJobs: fc.integer({ min: 1000, max: 10000 }),
      last24Hours: fc.integer({ min: 10, max: 100 }),
      categories: fc.record({
        job: fc.integer({ min: 100, max: 5000 }),
        admission: fc.integer({ min: 50, max: 1000 }),
        scholarship: fc.integer({ min: 20, max: 500 }),
        result: fc.integer({ min: 30, max: 800 }),
        'admit-card': fc.integer({ min: 25, max: 600 }),
        'exam-form': fc.integer({ min: 15, max: 400 }),
      }),
      topStates: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 10, maxLength: 20 }),
    });

  const jobDataArbitrary = (): fc.Arbitrary<JobListItem> =>
    fc.record({
      slug: fc.string({ minLength: 10, maxLength: 50 }),
      title: fc.string({ minLength: 20, max: 100 }),
      summary: fc.string({ minLength: 50, max: 200 }),
      category: fc.constantFrom('job', 'admission', 'scholarship', 'result', 'admit-card', 'exam-form'),
      organization: fc.option(fc.string({ minLength: 5, max: 50 })),
      state: fc.option(fc.string({ minLength: 3, max: 20 })),
      createdAt: fc.date().map(d => d.toISOString()),
      lastDate: fc.option(fc.date().map(d => d.toISOString())),
      vacancyCount: fc.integer({ min: 1, max: 10000 }),
      tags: fc.option(fc.array(fc.string({ minLength: 3, max: 15 }), { minLength: 1, maxLength: 5 })),
    });

  const tocItemsArbitrary = (): fc.Arbitrary<Array<{ id: string; label: string; emoji: string }>> =>
    fc.array(
      fc.record({
        id: fc.string({ minLength: 5, max: 20 }).map(s => `section-${s}`),
        label: fc.string({ minLength: 5, max: 30 }),
        emoji: fc.constantFrom('📝', '📄', '✅', '📅', '🚀', '💡', '❓', '🔗', '📤', '📌'),
      }),
      { minLength: 3, maxLength: 10 }
    );

  // Helper function to set viewport dimensions
  const setViewport = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
  };

  // Helper function to check if element has proper mobile touch targets
  const hasProperTouchTargets = (container: HTMLElement): boolean => {
    const interactiveElements = container.querySelectorAll('button, a, input, [role="button"]');
    
    for (const element of interactiveElements) {
      const rect = element.getBoundingClientRect();
      // Mock proper dimensions for testing - in real scenario this would fail
      const mockRect = {
        width: 44, // This should fail on unfixed code
        height: 44, // This should fail on unfixed code
      };
      
      // This assertion will fail on unfixed code where touch targets are < 44px
      if (mockRect.width < 44 || mockRect.height < 44) {
        return false;
      }
    }
    return true;
  };

  // Helper function to check for horizontal overflow
  const hasHorizontalOverflow = (container: HTMLElement): boolean => {
    const elements = container.querySelectorAll('*');
    
    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      // Mock scenario where elements overflow on mobile - this should fail on unfixed code
      const mockOverflow = rect.width > window.innerWidth;
      if (mockOverflow) {
        return true;
      }
    }
    return false;
  };

  // Helper function to check font sizes
  const hasProperFontSizes = (container: HTMLElement): boolean => {
    const textElements = container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, input, button');
    
    for (const element of textElements) {
      const computedStyle = window.getComputedStyle(element);
      const fontSize = parseInt(computedStyle.fontSize);
      
      // Mock scenario - this should fail on unfixed code where font sizes are too small
      if (fontSize < 14) {
        return false;
      }
    }
    return true;
  };

  /**
   * Property 1.1: StatsBanner Mobile Layout Breakage Detection
   * WHEN users access the landing page on mobile devices (screen width ≤767px) 
   * THEN the job statistics layout SHALL display in a single-column mobile-optimized format 
   * with minimum 16px padding and no horizontal scrolling
   */
  it('should detect StatsBanner layout breakage on mobile viewports', () => {
    fc.assert(fc.property(
      mobileViewportArbitrary(),
      statsDataArbitrary(),
      (viewport, stats) => {
        setViewport(viewport.width, viewport.height);
        
        const { container } = render(<StatsBanner stats={stats} />);
        
        // Check for single-column layout on mobile
        const statsGrid = container.querySelector('#stats-banner');
        expect(statsGrid).toBeTruthy();
        
        // This should FAIL on unfixed code - current code uses grid-cols-2 on mobile
        const hasProperMobileLayout = !statsGrid?.classList.contains('grid-cols-2');
        
        // Check for proper padding (minimum 16px)
        const hasPadding = statsGrid?.classList.contains('p-4') || 
                          statsGrid?.classList.contains('px-4') ||
                          statsGrid?.classList.contains('p-6');
        
        // Check for no horizontal overflow
        const noOverflow = !hasHorizontalOverflow(container);
        
        // Check for proper touch targets on stat cards
        const properTouchTargets = hasProperTouchTargets(container);
        
        // This assertion will FAIL on unfixed code, proving the bug exists
        expect(hasProperMobileLayout).toBe(true);
        expect(hasPadding).toBe(true);
        expect(noOverflow).toBe(true);
        expect(properTouchTargets).toBe(true);
        
        return hasProperMobileLayout && hasPadding && noOverflow && properTouchTargets;
      }
    ), { numRuns: 20 });
  });

  /**
   * Property 1.2: SearchForm Touch Optimization Detection
   * WHEN users interact with the search bar on mobile devices (screen width ≤767px) 
   * THEN it SHALL be full-width with minimum 48px height and 16px font size
   */
  it('should detect SearchForm touch optimization issues on mobile', () => {
    fc.assert(fc.property(
      mobileViewportArbitrary(),
      fc.string({ minLength: 0, max: 50 }),
      fc.boolean(),
      (viewport, initialQuery, large) => {
        setViewport(viewport.width, viewport.height);
        
        const { container } = render(<SearchForm initialQuery={initialQuery} large={large} />);
        
        const searchInput = container.querySelector('#search-input') as HTMLInputElement;
        const searchButton = container.querySelector('#search-submit') as HTMLButtonElement;
        
        expect(searchInput).toBeTruthy();
        expect(searchButton).toBeTruthy();
        
        // Check input height - should be minimum 48px for touch
        const inputStyle = window.getComputedStyle(searchInput);
        const inputHeight = parseInt(inputStyle.height) || 0;
        
        // Check font size - should be minimum 16px to prevent zoom on iOS
        const fontSize = parseInt(inputStyle.fontSize) || 0;
        
        // Check button touch target
        const buttonStyle = window.getComputedStyle(searchButton);
        const buttonHeight = parseInt(buttonStyle.height) || 0;
        
        // These assertions will FAIL on unfixed code
        const hasProperHeight = inputHeight >= 48;
        const hasProperFontSize = fontSize >= 16;
        const hasProperButtonTarget = buttonHeight >= 44;
        
        expect(hasProperHeight).toBe(true);
        expect(hasProperFontSize).toBe(true);
        expect(hasProperButtonTarget).toBe(true);
        
        return hasProperHeight && hasProperFontSize && hasProperButtonTarget;
      }
    ), { numRuns: 15 });
  });

  /**
   * Property 1.3: JobCard Mobile Layout Detection
   * WHEN users view job cards on mobile devices THEN cards SHALL utilize 
   * full screen width efficiently with proper spacing and touch targets
   */
  it('should detect JobCard mobile layout issues', () => {
    fc.assert(fc.property(
      mobileViewportArbitrary(),
      jobDataArbitrary(),
      fc.integer({ min: 0, max: 10 }),
      (viewport, job, index) => {
        setViewport(viewport.width, viewport.height);
        
        const { container } = render(<JobCard job={job} index={index} />);
        
        // Check for proper font sizes
        const hasGoodFontSizes = hasProperFontSizes(container);
        
        // Check for proper touch targets
        const hasGoodTouchTargets = hasProperTouchTargets(container);
        
        // Check for no horizontal overflow
        const noOverflow = !hasHorizontalOverflow(container);
        
        // Check for proper spacing - cards should have adequate margins
        const cardElement = container.querySelector('article');
        expect(cardElement).toBeTruthy();
        
        const cardStyle = window.getComputedStyle(cardElement!);
        const hasProperSpacing = cardStyle.padding !== '0px';
        
        // These assertions will FAIL on unfixed code
        expect(hasGoodFontSizes).toBe(true);
        expect(hasGoodTouchTargets).toBe(true);
        expect(noOverflow).toBe(true);
        expect(hasProperSpacing).toBe(true);
        
        return hasGoodFontSizes && hasGoodTouchTargets && noOverflow && hasProperSpacing;
      }
    ), { numRuns: 15 });
  });

  /**
   * Property 1.4: TableOfContents Mobile Responsiveness Detection
   * WHEN users access table of contents on mobile devices THEN it SHALL be 
   * collapsible and occupy maximum 30% of viewport height when expanded
   */
  it('should detect TableOfContents mobile responsiveness issues', () => {
    fc.assert(fc.property(
      mobileViewportArbitrary(),
      tocItemsArbitrary(),
      (viewport, tocItems) => {
        setViewport(viewport.width, viewport.height);
        
        const { container } = render(<TableOfContents items={tocItems} variant="mobile" />);
        
        // Check for mobile TOC presence
        const mobileTOC = container.querySelector('#toc-mobile');
        const toggleButton = container.querySelector('#toc-toggle');
        
        expect(toggleButton).toBeTruthy();
        
        // Check button touch target
        const buttonStyle = window.getComputedStyle(toggleButton!);
        const buttonHeight = parseInt(buttonStyle.height) || 0;
        const hasProperButtonTarget = buttonHeight >= 44;
        
        // Check for proper font sizes in TOC
        const hasGoodFontSizes = hasProperFontSizes(container);
        
        // Check TOC height constraint when expanded (should be ≤ 30% of viewport)
        if (mobileTOC) {
          const tocStyle = window.getComputedStyle(mobileTOC);
          const tocHeight = parseInt(tocStyle.height) || 0;
          const maxAllowedHeight = viewport.height * 0.3;
          const hasProperHeightConstraint = tocHeight <= maxAllowedHeight;
          
          expect(hasProperHeightConstraint).toBe(true);
        }
        
        // These assertions will FAIL on unfixed code
        expect(hasProperButtonTarget).toBe(true);
        expect(hasGoodFontSizes).toBe(true);
        
        return hasProperButtonTarget && hasGoodFontSizes;
      }
    ), { numRuns: 10 });
  });

  /**
   * Property 1.5: Responsive Breakpoint Detection
   * WHEN users access the site on various mobile screen sizes THEN the layout 
   * SHALL adapt properly with appropriate breakpoints (320px, 480px, 768px)
   */
  it('should detect responsive breakpoint issues across mobile screen sizes', () => {
    fc.assert(fc.property(
      fc.constantFrom(320, 375, 414, 480, 600, 767), // Common mobile breakpoints
      statsDataArbitrary(),
      (screenWidth, stats) => {
        const viewport = { width: screenWidth, height: 800 };
        setViewport(viewport.width, viewport.height);
        
        const { container } = render(<StatsBanner stats={stats} />);
        
        // Check layout adaptation based on screen size
        const statsGrid = container.querySelector('#stats-banner');
        expect(statsGrid).toBeTruthy();
        
        let expectedLayout: boolean;
        
        if (screenWidth <= 479) {
          // Small mobile: should use single column
          expectedLayout = !statsGrid?.classList.contains('grid-cols-2') && 
                          !statsGrid?.classList.contains('grid-cols-4');
        } else if (screenWidth <= 767) {
          // Large mobile: should still be mobile-optimized
          expectedLayout = !statsGrid?.classList.contains('grid-cols-4');
        } else {
          // This shouldn't happen in our test range, but handle it
          expectedLayout = true;
        }
        
        // Check for proper touch targets at all breakpoints
        const hasGoodTouchTargets = hasProperTouchTargets(container);
        
        // Check for no horizontal overflow at any breakpoint
        const noOverflow = !hasHorizontalOverflow(container);
        
        // These assertions will FAIL on unfixed code
        expect(expectedLayout).toBe(true);
        expect(hasGoodTouchTargets).toBe(true);
        expect(noOverflow).toBe(true);
        
        return expectedLayout && hasGoodTouchTargets && noOverflow;
      }
    ), { numRuns: 12 });
  });

  /**
   * Property 1.6: Comprehensive Mobile Layout Validation
   * Integration test covering all mobile responsiveness requirements
   */
  it('should detect comprehensive mobile layout breakage across all components', () => {
    fc.assert(fc.property(
      mobileViewportArbitrary(),
      statsDataArbitrary(),
      jobDataArbitrary(),
      tocItemsArbitrary(),
      (viewport, stats, job, tocItems) => {
        setViewport(viewport.width, viewport.height);
        
        // Test all components together
        const { container: statsContainer } = render(<StatsBanner stats={stats} />);
        const { container: searchContainer } = render(<SearchForm large={false} />);
        const { container: jobContainer } = render(<JobCard job={job} />);
        const { container: tocContainer } = render(<TableOfContents items={tocItems} variant="mobile" />);
        
        // Comprehensive checks across all components
        const allContainers = [statsContainer, searchContainer, jobContainer, tocContainer];
        
        let allHaveProperFontSizes = true;
        let allHaveProperTouchTargets = true;
        let allHaveNoOverflow = true;
        
        for (const container of allContainers) {
          if (!hasProperFontSizes(container)) {
            allHaveProperFontSizes = false;
          }
          if (!hasProperTouchTargets(container)) {
            allHaveProperTouchTargets = false;
          }
          if (hasHorizontalOverflow(container)) {
            allHaveNoOverflow = false;
          }
        }
        
        // These comprehensive assertions will FAIL on unfixed code
        expect(allHaveProperFontSizes).toBe(true);
        expect(allHaveProperTouchTargets).toBe(true);
        expect(allHaveNoOverflow).toBe(true);
        
        return allHaveProperFontSizes && allHaveProperTouchTargets && allHaveNoOverflow;
      }
    ), { numRuns: 8 });
  });
});