/**
 * Preservation Property-Based Tests for Mobile Responsiveness Fix
 * 
 * **IMPORTANT**: Follow observation-first methodology
 * **EXPECTED OUTCOME**: Tests PASS on unfixed code (confirms baseline behavior to preserve)
 * 
 * These tests capture the current behavior of desktop (≥1024px) and tablet (768px-1023px) 
 * layouts to ensure they remain unaffected when mobile responsiveness issues are fixed.
 * 
 * **Feature: mobile-responsive-fix, Property 2: Preservation - Desktop and Tablet Layout Preservation**
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('Feature: mobile-responsive-fix, Property 2: Preservation - Desktop and Tablet Layout Preservation', () => {
  let originalInnerWidth: number;
  let originalInnerHeight: number;

  beforeEach(() => {
    // Store original viewport dimensions
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
    
    // Mock getBoundingClientRect for layout calculations
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 300,
      height: 50,
      top: 0,
      left: 0,
      bottom: 50,
      right: 300,
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
  const desktopViewportArbitrary = (): fc.Arbitrary<{ width: number; height: number }> =>
    fc.record({
      width: fc.integer({ min: 1024, max: 2560 }), // Desktop viewport widths
      height: fc.integer({ min: 768, max: 1440 }), // Desktop heights
    });

  const tabletViewportArbitrary = (): fc.Arbitrary<{ width: number; height: number }> =>
    fc.record({
      width: fc.integer({ min: 768, max: 1023 }), // Tablet viewport widths
      height: fc.integer({ min: 600, max: 1366 }), // Tablet heights
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
      topStates: fc.array(
        fc.record({
          state: fc.string({ minLength: 3, maxLength: 20 }),
          count: fc.integer({ min: 10, max: 500 }),
        }),
        { minLength: 10, maxLength: 20 }
      ),
    });

  const jobDataArbitrary = (): fc.Arbitrary<JobListItem> =>
    fc.record({
      _id: fc.string({ minLength: 24, maxLength: 24 }),
      slug: fc.string({ minLength: 10, maxLength: 50 }),
      title: fc.string({ minLength: 20, maxLength: 100 }),
      summary: fc.string({ minLength: 50, maxLength: 200 }),
      category: fc.constantFrom('job', 'admission', 'scholarship', 'result', 'admit-card', 'exam-form'),
      organization: fc.string({ minLength: 5, maxLength: 50 }),
      state: fc.string({ minLength: 3, maxLength: 20 }),
      createdAt: fc.constantFrom('2024-01-01T00:00:00.000Z', '2024-06-01T00:00:00.000Z', '2024-12-01T00:00:00.000Z'),
      lastDate: fc.option(fc.constantFrom('2024-12-31T00:00:00.000Z', '2025-01-31T00:00:00.000Z', '2025-06-30T00:00:00.000Z')),
      vacancyCount: fc.integer({ min: 1, max: 10000 }),
      tags: fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 1, maxLength: 5 }),
    });

  const tocItemsArbitrary = (): fc.Arbitrary<Array<{ id: string; label: string; emoji: string }>> =>
    fc.array(
      fc.record({
        id: fc.string({ minLength: 5, maxLength: 20 }).map(s => `section-${s}`),
        label: fc.string({ minLength: 5, maxLength: 30 }),
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

  // Helper function to check desktop layout characteristics
  const hasDesktopLayoutCharacteristics = (container: HTMLElement): boolean => {
    // Check for multi-column layouts that are expected on desktop
    const statsGrid = container.querySelector('#stats-banner');
    if (statsGrid) {
      // Desktop should use 4-column grid (lg:grid-cols-4)
      const hasDesktopGrid = statsGrid.classList.contains('lg:grid-cols-4') || 
                            statsGrid.classList.contains('grid-cols-4');
      if (!hasDesktopGrid) return false;
    }

    // Check for desktop-specific elements
    const desktopTOC = container.querySelector('#toc-desktop');
    if (desktopTOC) {
      // Desktop TOC should be visible and positioned as sidebar
      const isHidden = desktopTOC.classList.contains('hidden') && 
                      desktopTOC.classList.contains('lg:block');
      if (!isHidden) return false;
    }

    return true;
  };

  // Helper function to check tablet layout characteristics
  const hasTabletLayoutCharacteristics = (container: HTMLElement): boolean => {
    // Tablet layouts should be between mobile and desktop
    // Should not use full desktop 4-column but also not single column
    const statsGrid = container.querySelector('#stats-banner');
    if (statsGrid) {
      // Should have some grid structure but not necessarily 4 columns
      const hasGridStructure = statsGrid.classList.contains('grid') ||
                              statsGrid.classList.contains('grid-cols-2') ||
                              statsGrid.classList.contains('grid-cols-3');
      if (!hasGridStructure) return false;
    }

    return true;
  };

  // Helper function to check search functionality
  const hasWorkingSearchFunctionality = (container: HTMLElement): boolean => {
    const searchInput = container.querySelector('#search-input') as HTMLInputElement;
    const searchButton = container.querySelector('#search-submit') as HTMLButtonElement;
    
    if (!searchInput || !searchButton) return false;
    
    // Check that elements are properly accessible
    return searchInput.type === 'text' && 
           searchButton.type === 'submit' &&
           !searchInput.disabled &&
           !searchButton.disabled;
  };

  // Helper function to check navigation functionality
  const hasWorkingNavigation = (container: HTMLElement): boolean => {
    const links = container.querySelectorAll('a[href]');
    
    // Should have clickable links with proper href attributes
    for (const link of links) {
      const href = link.getAttribute('href');
      if (!href || href === '#') return false;
    }
    
    return links.length > 0;
  };

  // Helper function to check performance characteristics
  const hasGoodPerformanceCharacteristics = (container: HTMLElement): boolean => {
    // Check for performance-friendly patterns
    const images = container.querySelectorAll('img');
    const heavyElements = container.querySelectorAll('video, iframe, object, embed');
    
    // Should not have excessive heavy elements that could impact performance
    return heavyElements.length <= 2;
  };

  /**
   * Property 2.1: Desktop Layout Preservation (≥1024px)
   * Desktop layout continues to display correctly with existing design
   */
  it('should preserve desktop layout characteristics on desktop viewports', () => {
    fc.assert(fc.property(
      desktopViewportArbitrary(),
      statsDataArbitrary(),
      jobDataArbitrary(),
      tocItemsArbitrary(),
      (viewport, stats, job, tocItems) => {
        setViewport(viewport.width, viewport.height);
        
        // Test StatsBanner on desktop
        const { container: statsContainer } = render(<StatsBanner stats={stats} />);
        const hasDesktopStats = hasDesktopLayoutCharacteristics(statsContainer);
        
        // Test SearchForm on desktop
        const { container: searchContainer } = render(<SearchForm large={true} />);
        const hasWorkingSearch = hasWorkingSearchFunctionality(searchContainer);
        
        // Test JobCard on desktop
        const { container: jobContainer } = render(<JobCard job={job} />);
        const hasWorkingJobNav = hasWorkingNavigation(jobContainer);
        
        // Test TableOfContents on desktop
        const { container: tocContainer } = render(<TableOfContents items={tocItems} variant="desktop" />);
        const desktopTOC = tocContainer.querySelector('#toc-desktop');
        const hasDesktopTOC = desktopTOC !== null;
        
        // These should PASS on unfixed code (preserving current desktop behavior)
        expect(hasDesktopStats).toBe(true);
        expect(hasWorkingSearch).toBe(true);
        expect(hasWorkingJobNav).toBe(true);
        expect(hasDesktopTOC).toBe(true);
        
        return hasDesktopStats && hasWorkingSearch && hasWorkingJobNav && hasDesktopTOC;
      }
    ), { numRuns: 15 });
  });

  /**
   * Property 2.2: Tablet Layout Preservation (768px-1023px)
   * Tablet layout provides appropriate viewing experience
   */
  it('should preserve tablet layout characteristics on tablet viewports', () => {
    fc.assert(fc.property(
      tabletViewportArbitrary(),
      statsDataArbitrary(),
      jobDataArbitrary(),
      (viewport, stats, job) => {
        setViewport(viewport.width, viewport.height);
        
        // Test StatsBanner on tablet
        const { container: statsContainer } = render(<StatsBanner stats={stats} />);
        const hasTabletStats = hasTabletLayoutCharacteristics(statsContainer);
        
        // Test SearchForm on tablet
        const { container: searchContainer } = render(<SearchForm large={false} />);
        const hasWorkingSearch = hasWorkingSearchFunctionality(searchContainer);
        
        // Test JobCard on tablet
        const { container: jobContainer } = render(<JobCard job={job} />);
        const hasWorkingJobNav = hasWorkingNavigation(jobContainer);
        
        // These should PASS on unfixed code (preserving current tablet behavior)
        expect(hasTabletStats).toBe(true);
        expect(hasWorkingSearch).toBe(true);
        expect(hasWorkingJobNav).toBe(true);
        
        return hasTabletStats && hasWorkingSearch && hasWorkingJobNav;
      }
    ), { numRuns: 12 });
  });

  /**
   * Property 2.3: Search and Navigation Functionality Preservation
   * All existing functionality (search, navigation, job applications) works correctly
   */
  it('should preserve search and navigation functionality across desktop and tablet', () => {
    fc.assert(fc.property(
      fc.oneof(desktopViewportArbitrary(), tabletViewportArbitrary()),
      fc.string({ minLength: 0, maxLength: 50 }),
      jobDataArbitrary(),
      (viewport, searchQuery, job) => {
        setViewport(viewport.width, viewport.height);
        
        // Test SearchForm functionality
        const { container: searchContainer } = render(<SearchForm initialQuery={searchQuery} />);
        const searchInput = searchContainer.querySelector('#search-input') as HTMLInputElement;
        const searchButton = searchContainer.querySelector('#search-submit') as HTMLButtonElement;
        
        expect(searchInput).toBeTruthy();
        expect(searchButton).toBeTruthy();
        
        // Test that search input can be interacted with
        fireEvent.change(searchInput, { target: { value: 'test query' } });
        expect(searchInput.value).toBe('test query');
        
        // Test JobCard navigation links
        const { container: jobContainer } = render(<JobCard job={job} />);
        const jobLinks = jobContainer.querySelectorAll('a[href]');
        
        // Should have working navigation links
        const hasValidLinks = Array.from(jobLinks).every(link => {
          const href = link.getAttribute('href');
          return href && href !== '#' && href.length > 0;
        });
        
        // These should PASS on unfixed code (preserving current functionality)
        expect(hasValidLinks).toBe(true);
        expect(jobLinks.length).toBeGreaterThan(0);
        
        return hasValidLinks && jobLinks.length > 0;
      }
    ), { numRuns: 10 });
  });

  /**
   * Property 2.4: Performance and Loading Characteristics Preservation
   * Performance and loading times meet current standards
   */
  it('should preserve performance characteristics on desktop and tablet', () => {
    fc.assert(fc.property(
      fc.oneof(desktopViewportArbitrary(), tabletViewportArbitrary()),
      statsDataArbitrary(),
      fc.array(jobDataArbitrary(), { minLength: 1, maxLength: 5 }),
      (viewport, stats, jobs) => {
        setViewport(viewport.width, viewport.height);
        
        // Test rendering performance by measuring component render
        const startTime = performance.now();
        
        const { container: statsContainer } = render(<StatsBanner stats={stats} />);
        
        // Render multiple job cards to simulate list performance
        const jobContainers = jobs.map((job, index) => 
          render(<JobCard job={job} index={index} />)
        );
        
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        // Check performance characteristics
        const hasGoodPerf = hasGoodPerformanceCharacteristics(statsContainer);
        
        // Rendering should be reasonably fast (less than 100ms for this test)
        const isPerformant = renderTime < 100;
        
        // Check that components don't have excessive DOM nodes
        const totalNodes = statsContainer.querySelectorAll('*').length + 
                          jobContainers.reduce((sum, { container }) => 
                            sum + container.querySelectorAll('*').length, 0);
        
        const hasReasonableComplexity = totalNodes < 200; // Reasonable DOM complexity
        
        // These should PASS on unfixed code (preserving current performance)
        expect(hasGoodPerf).toBe(true);
        expect(isPerformant).toBe(true);
        expect(hasReasonableComplexity).toBe(true);
        
        return hasGoodPerf && isPerformant && hasReasonableComplexity;
      }
    ), { numRuns: 8 });
  });

  /**
   * Property 2.5: SEO and Metadata Functionality Preservation
   * SEO-optimized content and metadata function correctly across layouts
   */
  it('should preserve SEO and metadata functionality on desktop and tablet', () => {
    fc.assert(fc.property(
      fc.oneof(desktopViewportArbitrary(), tabletViewportArbitrary()),
      jobDataArbitrary(),
      tocItemsArbitrary(),
      (viewport, job, tocItems) => {
        setViewport(viewport.width, viewport.height);
        
        // Test JobCard SEO elements
        const { container: jobContainer } = render(<JobCard job={job} />);
        
        // Check for SEO-friendly elements
        const hasHeading = jobContainer.querySelector('h3') !== null;
        const hasStructuredContent = jobContainer.querySelector('article') !== null;
        const hasTimeElement = jobContainer.querySelector('time') !== null;
        
        // Check for proper link structure
        const links = jobContainer.querySelectorAll('a[href]');
        const hasValidLinkStructure = Array.from(links).every(link => {
          const href = link.getAttribute('href');
          return href && href.startsWith('/') && !href.includes('javascript:');
        });
        
        // Test TableOfContents navigation structure
        const { container: tocContainer } = render(<TableOfContents items={tocItems} />);
        const tocButtons = tocContainer.querySelectorAll('button');
        const hasAccessibleNavigation = tocButtons.length > 0;
        
        // These should PASS on unfixed code (preserving current SEO structure)
        expect(hasHeading).toBe(true);
        expect(hasStructuredContent).toBe(true);
        expect(hasTimeElement).toBe(true);
        expect(hasValidLinkStructure).toBe(true);
        expect(hasAccessibleNavigation).toBe(true);
        
        return hasHeading && hasStructuredContent && hasTimeElement && 
               hasValidLinkStructure && hasAccessibleNavigation;
      }
    ), { numRuns: 10 });
  });

  /**
   * Property 2.6: Layout Consistency Across Desktop Breakpoints
   * Desktop layout remains consistent across different desktop screen sizes
   */
  it('should maintain layout consistency across desktop breakpoints', () => {
    fc.assert(fc.property(
      fc.constantFrom(1024, 1280, 1366, 1440, 1920, 2560), // Common desktop widths
      statsDataArbitrary(),
      (screenWidth, stats) => {
        const viewport = { width: screenWidth, height: 1080 };
        setViewport(viewport.width, viewport.height);
        
        const { container } = render(<StatsBanner stats={stats} />);
        
        // Desktop should consistently use 4-column layout
        const statsGrid = container.querySelector('#stats-banner');
        expect(statsGrid).toBeTruthy();
        
        const hasConsistentDesktopLayout = statsGrid?.classList.contains('lg:grid-cols-4') ||
                                          statsGrid?.classList.contains('grid-cols-4');
        
        // Check that layout doesn't break at different desktop sizes
        const elements = container.querySelectorAll('*');
        let hasProperSpacing = true;
        
        for (const element of elements) {
          const computedStyle = window.getComputedStyle(element);
          // Elements should have reasonable dimensions
          if (computedStyle.width === '0px' && computedStyle.height === '0px') {
            hasProperSpacing = false;
            break;
          }
        }
        
        // These should PASS on unfixed code (preserving desktop consistency)
        expect(hasConsistentDesktopLayout).toBe(true);
        expect(hasProperSpacing).toBe(true);
        
        return hasConsistentDesktopLayout && hasProperSpacing;
      }
    ), { numRuns: 12 });
  });

  /**
   * Property 2.7: Interactive Element Functionality Preservation
   * All interactive elements continue to work properly on desktop and tablet
   */
  it('should preserve interactive element functionality on desktop and tablet', () => {
    fc.assert(fc.property(
      fc.oneof(desktopViewportArbitrary(), tabletViewportArbitrary()),
      tocItemsArbitrary(),
      fc.string({ minLength: 5, maxLength: 30 }),
      (viewport, tocItems, searchTerm) => {
        setViewport(viewport.width, viewport.height);
        
        // Test TableOfContents interactivity
        const { container: tocContainer } = render(<TableOfContents items={tocItems} />);
        const tocButtons = tocContainer.querySelectorAll('button');
        
        // Test that buttons are clickable
        let buttonsClickable = true;
        tocButtons.forEach(button => {
          if (button.disabled) {
            buttonsClickable = false;
          }
        });
        
        // Test SearchForm interactivity
        const { container: searchContainer } = render(<SearchForm initialQuery="" />);
        const searchInput = searchContainer.querySelector('#search-input') as HTMLInputElement;
        const searchButton = searchContainer.querySelector('#search-submit') as HTMLButtonElement;
        
        // Test form submission
        let formInteractive = false;
        if (searchInput && searchButton) {
          fireEvent.change(searchInput, { target: { value: searchTerm } });
          formInteractive = searchInput.value === searchTerm && !searchButton.disabled;
        }
        
        // These should PASS on unfixed code (preserving current interactivity)
        expect(buttonsClickable).toBe(true);
        expect(formInteractive).toBe(true);
        expect(tocButtons.length).toBeGreaterThan(0);
        
        return buttonsClickable && formInteractive && tocButtons.length > 0;
      }
    ), { numRuns: 10 });
  });
});