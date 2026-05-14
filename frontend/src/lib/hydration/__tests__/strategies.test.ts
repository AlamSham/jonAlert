/**
 * Unit tests for script loading strategies
 * Tests strategy determination, script type detection, and validation
 */

import {
  determineLoadingStrategy,
  isAnalyticsScript,
  isAdScript,
  isPushNotificationScript,
  isStructuredDataScript,
  hasServerClientMismatchRisk,
  hasDOMManipulation,
  hasDynamicContent,
  getRecommendedConfig,
  validateScriptStrategy,
  getLoadingPriority,
} from '../strategies';
import { LoadingStrategy, ScriptConfig, LoadingContext } from '../types';

describe('Script Loading Strategies', () => {
  const mockServerContext: LoadingContext = {
    isServer: true,
    isHydrated: false,
  };

  const mockClientContext: LoadingContext = {
    isServer: false,
    isHydrated: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  };

  describe('Strategy Determination', () => {
    it('should use explicit strategy when provided', () => {
      const config = {
        id: 'test-script',
        strategy: LoadingStrategy.DEFERRED,
      };

      const strategy = determineLoadingStrategy(config, mockClientContext);
      expect(strategy).toBe(LoadingStrategy.DEFERRED);
    });

    it('should determine DEFERRED strategy for analytics scripts', () => {
      const config = {
        id: 'google-analytics-script',
        src: 'https://www.googletagmanager.com/gtag/js',
      };

      const strategy = determineLoadingStrategy(config, mockClientContext);
      expect(strategy).toBe(LoadingStrategy.DEFERRED);
    });

    it('should determine CLIENT_ONLY strategy for ad scripts', () => {
      const config = {
        id: 'google-adsense-script',
        src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
      };

      const strategy = determineLoadingStrategy(config, mockClientContext);
      expect(strategy).toBe(LoadingStrategy.CLIENT_ONLY);
    });

    it('should determine DEFERRED strategy for push notification scripts', () => {
      const config = {
        id: 'onesignal-script',
        src: 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js',
      };

      const strategy = determineLoadingStrategy(config, mockClientContext);
      expect(strategy).toBe(LoadingStrategy.DEFERRED);
    });

    it('should determine SSR strategy for static JSON-LD', () => {
      const config = {
        id: 'json-ld-script',
        content: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Test Organization',
        }),
      };

      const strategy = determineLoadingStrategy(config, mockServerContext);
      expect(strategy).toBe(LoadingStrategy.SSR);
    });

    it('should determine CLIENT_ONLY strategy for dynamic JSON-LD', () => {
      const config = {
        id: 'dynamic-json-ld-script',
        content: `{
          "@context": "https://schema.org",
          "@type": "Article",
          "datePublished": "${new Date().toISOString()}"
        }`,
      };

      const strategy = determineLoadingStrategy(config, mockServerContext);
      expect(strategy).toBe(LoadingStrategy.CLIENT_ONLY);
    });

    it('should determine CLIENT_ONLY strategy for DOM manipulation scripts', () => {
      const config = {
        id: 'dom-script',
        content: 'document.getElementById("test").innerHTML = "Hello";',
      };

      const strategy = determineLoadingStrategy(config, mockServerContext);
      expect(strategy).toBe(LoadingStrategy.CLIENT_ONLY);
    });
  });

  describe('Script Type Detection', () => {
    describe('Analytics Scripts', () => {
      it('should detect Google Analytics scripts', () => {
        expect(isAnalyticsScript('google-analytics', '')).toBe(true);
        expect(isAnalyticsScript('gtag-script', '')).toBe(true);
        expect(isAnalyticsScript('', 'https://www.googletagmanager.com/gtag/js')).toBe(true);
        expect(isAnalyticsScript('', 'https://www.google-analytics.com/analytics.js')).toBe(true);
      });

      it('should detect Vercel Analytics scripts', () => {
        expect(isAnalyticsScript('vercel-analytics', '')).toBe(true);
        expect(isAnalyticsScript('', 'https://vercel.com/analytics/script.js')).toBe(true);
      });

      it('should not detect non-analytics scripts', () => {
        expect(isAnalyticsScript('regular-script', '')).toBe(false);
        expect(isAnalyticsScript('', 'https://example.com/script.js')).toBe(false);
      });
    });

    describe('Ad Scripts', () => {
      it('should detect Google AdSense scripts', () => {
        expect(isAdScript('adsense-script', '')).toBe(true);
        expect(isAdScript('adsbygoogle', '')).toBe(true);
        expect(isAdScript('', 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')).toBe(true);
      });

      it('should not detect non-ad scripts', () => {
        expect(isAdScript('regular-script', '')).toBe(false);
        expect(isAdScript('', 'https://example.com/script.js')).toBe(false);
      });
    });

    describe('Push Notification Scripts', () => {
      it('should detect OneSignal scripts', () => {
        expect(isPushNotificationScript('onesignal-init', '')).toBe(true);
        expect(isPushNotificationScript('', 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js')).toBe(true);
      });

      it('should detect Firebase messaging scripts', () => {
        expect(isPushNotificationScript('firebase-messaging', '')).toBe(true);
        expect(isPushNotificationScript('', 'https://firebase.googleapis.com/firebase-messaging-sw.js')).toBe(true);
      });

      it('should not detect non-push scripts', () => {
        expect(isPushNotificationScript('regular-script', '')).toBe(false);
        expect(isPushNotificationScript('', 'https://example.com/script.js')).toBe(false);
      });
    });

    describe('Structured Data Scripts', () => {
      it('should detect JSON-LD scripts', () => {
        const jsonLdContent = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
        });
        expect(isStructuredDataScript(jsonLdContent)).toBe(true);
      });

      it('should detect application/ld+json type', () => {
        const content = '<script type="application/ld+json">{"@context": "https://schema.org"}</script>';
        expect(isStructuredDataScript(content)).toBe(true);
      });

      it('should not detect regular scripts', () => {
        expect(isStructuredDataScript('console.log("hello");')).toBe(false);
      });
    });
  });

  describe('Risk Detection', () => {
    describe('Server/Client Mismatch Risk', () => {
      it('should detect Date-related risks', () => {
        expect(hasServerClientMismatchRisk('new Date()')).toBe(true);
        expect(hasServerClientMismatchRisk('Date.now()')).toBe(true);
      });

      it('should detect random value risks', () => {
        expect(hasServerClientMismatchRisk('Math.random()')).toBe(true);
        expect(hasServerClientMismatchRisk('crypto.getRandomValues')).toBe(true);
      });

      it('should detect browser-specific risks', () => {
        expect(hasServerClientMismatchRisk('window.location')).toBe(true);
        expect(hasServerClientMismatchRisk('navigator.userAgent')).toBe(true);
        expect(hasServerClientMismatchRisk('localStorage.getItem')).toBe(true);
      });

      it('should not detect safe content', () => {
        expect(hasServerClientMismatchRisk('console.log("hello");')).toBe(false);
        expect(hasServerClientMismatchRisk('const x = 42;')).toBe(false);
      });
    });

    describe('DOM Manipulation Detection', () => {
      it('should detect document.write usage', () => {
        expect(hasDOMManipulation('document.write("<div>test</div>");')).toBe(true);
        expect(hasDOMManipulation('document.writeln("test");')).toBe(true);
      });

      it('should detect innerHTML usage', () => {
        expect(hasDOMManipulation('element.innerHTML = "test";')).toBe(true);
        expect(hasDOMManipulation('element.outerHTML = "test";')).toBe(true);
      });

      it('should detect DOM creation methods', () => {
        expect(hasDOMManipulation('document.createElement("div");')).toBe(true);
        expect(hasDOMManipulation('parent.appendChild(child);')).toBe(true);
      });

      it('should not detect safe operations', () => {
        expect(hasDOMManipulation('console.log("hello");')).toBe(false);
        expect(hasDOMManipulation('const x = element.textContent;')).toBe(false);
      });
    });

    describe('Dynamic Content Detection', () => {
      it('should detect dynamic values', () => {
        expect(hasDynamicContent('Math.random()')).toBe(true);
        expect(hasDynamicContent('new Date()')).toBe(true);
        expect(hasDynamicContent('performance.now()')).toBe(true);
      });

      it('should detect screen dimensions', () => {
        expect(hasDynamicContent('screen.width')).toBe(true);
        expect(hasDynamicContent('window.innerHeight')).toBe(true);
      });

      it('should not detect static content', () => {
        expect(hasDynamicContent('const x = 42;')).toBe(false);
        expect(hasDynamicContent('console.log("static");')).toBe(false);
      });
    });
  });

  describe('Recommended Configurations', () => {
    it('should provide Google AdSense configuration', () => {
      const config = getRecommendedConfig('google-adsense');
      expect(config.strategy).toBe(LoadingStrategy.CLIENT_ONLY);
      expect(config.async).toBe(true);
      expect(config.crossOrigin).toBe('anonymous');
    });

    it('should provide Google Analytics configuration', () => {
      const config = getRecommendedConfig('google-analytics');
      expect(config.strategy).toBe(LoadingStrategy.DEFERRED);
      expect(config.async).toBe(true);
    });

    it('should provide OneSignal configuration', () => {
      const config = getRecommendedConfig('onesignal');
      expect(config.strategy).toBe(LoadingStrategy.DEFERRED);
    });

    it('should provide JSON-LD configuration', () => {
      const config = getRecommendedConfig('json-ld');
      expect(config.strategy).toBe(LoadingStrategy.SSR);
    });

    it('should provide default configuration for unknown types', () => {
      const config = getRecommendedConfig('unknown-script-type');
      expect(config.strategy).toBe(LoadingStrategy.CLIENT_ONLY);
      expect(config.timeout).toBe(10000);
    });
  });

  describe('Strategy Validation', () => {
    it('should warn about SSR strategy with dynamic content', () => {
      const config: ScriptConfig = {
        id: 'dynamic-ssr',
        content: 'const timestamp = new Date();',
        strategy: LoadingStrategy.SSR,
      };

      const warnings = validateScriptStrategy(config, mockServerContext);
      expect(warnings).toContain('SSR strategy with dynamic content may cause hydration mismatches');
    });

    it('should warn about SSR strategy with DOM manipulation', () => {
      const config: ScriptConfig = {
        id: 'dom-ssr',
        content: 'document.write("test");',
        strategy: LoadingStrategy.SSR,
      };

      const warnings = validateScriptStrategy(config, mockServerContext);
      expect(warnings).toContain('SSR strategy with DOM manipulation may cause hydration issues');
    });

    it('should warn about CLIENT_ONLY strategy for structured data', () => {
      const config: ScriptConfig = {
        id: 'seo-client-only',
        content: '{"@context": "https://schema.org", "@type": "Article"}',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      const warnings = validateScriptStrategy(config, mockClientContext);
      expect(warnings).toContain('CLIENT_ONLY strategy for structured data may impact SEO');
    });

    it('should warn about DEFERRED strategy with dependencies', () => {
      const config: ScriptConfig = {
        id: 'deferred-deps',
        content: 'console.log("test");',
        strategy: LoadingStrategy.DEFERRED,
        dependencies: ['jquery', 'bootstrap'],
      };

      const warnings = validateScriptStrategy(config, mockClientContext);
      expect(warnings).toContain('DEFERRED strategy with dependencies may cause loading delays');
    });

    it('should return no warnings for valid configurations', () => {
      const config: ScriptConfig = {
        id: 'valid-script',
        content: 'console.log("hello");',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      const warnings = validateScriptStrategy(config, mockClientContext);
      expect(warnings).toHaveLength(0);
    });
  });

  describe('Loading Priority', () => {
    it('should assign highest priority to SSR scripts', () => {
      const config: ScriptConfig = {
        id: 'ssr-script',
        content: 'console.log("ssr");',
        strategy: LoadingStrategy.SSR,
      };

      const priority = getLoadingPriority(config);
      expect(priority).toBe(100);
    });

    it('should assign medium priority to CLIENT_ONLY scripts', () => {
      const config: ScriptConfig = {
        id: 'client-script',
        content: 'console.log("client");',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      const priority = getLoadingPriority(config);
      expect(priority).toBe(50);
    });

    it('should assign low priority to DEFERRED scripts', () => {
      const config: ScriptConfig = {
        id: 'deferred-script',
        content: 'console.log("deferred");',
        strategy: LoadingStrategy.DEFERRED,
      };

      const priority = getLoadingPriority(config);
      expect(priority).toBe(10);
    });

    it('should boost priority for structured data', () => {
      const config: ScriptConfig = {
        id: 'json-ld-script',
        content: '{"@context": "https://schema.org"}',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      const priority = getLoadingPriority(config);
      expect(priority).toBe(70); // 50 + 20 boost
    });

    it('should reduce priority for analytics scripts', () => {
      const config: ScriptConfig = {
        id: 'google-analytics',
        content: 'console.log("analytics");',
        strategy: LoadingStrategy.DEFERRED,
      };

      const priority = getLoadingPriority(config);
      expect(priority).toBe(0); // 10 - 10 reduction
    });

    it('should assign lowest priority to ad scripts', () => {
      const config: ScriptConfig = {
        id: 'adsense-script',
        content: 'console.log("ads");',
        strategy: LoadingStrategy.CLIENT_ONLY,
      };

      const priority = getLoadingPriority(config);
      expect(priority).toBe(30); // 50 - 20 reduction
    });
  });
});