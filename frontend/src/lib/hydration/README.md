# Hydration-Safe Analytics System

This directory contains the implementation of a comprehensive hydration-safe analytics management system for Next.js applications. The system addresses React hydration mismatch errors while maintaining full analytics functionality.

## Overview

The system implements **Task 6.1: Create AnalyticsManager class with provider isolation** from the hydration mismatch fix specification, providing:

- **Provider Registration and Management** (Requirement 3.1)
- **Event Queuing System for Pre-Hydration Events** (Requirement 3.2)  
- **DOM Isolation Mechanisms for Third-Party Scripts** (Requirement 3.3)

## Architecture

### Core Components

1. **AnalyticsManager** - Central coordinator for all analytics operations
2. **Analytics Providers** - Isolated implementations for different analytics services
3. **Event Queue System** - Manages events before and after hydration
4. **React Integration** - Hooks and components for seamless React integration

### Key Features

- **Hydration Safety**: Prevents SSR/CSR mismatches by deferring analytics until after hydration
- **Event Queuing**: Captures events before providers are loaded and replays them after hydration
- **Provider Isolation**: Isolates third-party scripts to prevent DOM conflicts
- **Error Recovery**: Graceful fallback strategies for failed providers
- **Performance Monitoring**: Built-in Web Vitals tracking with minimal overhead

## Usage

### Basic Setup

```typescript
import { AnalyticsProvider } from '@/lib/hydration';

// Wrap your app with the AnalyticsProvider
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

### Using Analytics Hooks

```typescript
import { useAnalytics } from '@/lib/hydration';

function MyComponent() {
  const { trackEvent, trackPageView } = useAnalytics();

  const handleClick = () => {
    trackEvent({
      type: 'button_click',
      data: {
        button_name: 'subscribe',
        event_category: 'engagement',
      },
    });
  };

  return <button onClick={handleClick}>Subscribe</button>;
}
```

### Replacing Existing Components

Replace the existing analytics components with hydration-safe versions:

```typescript
// Before (causes hydration mismatches)
import { WebVitals } from '@/components/WebVitals';
import { JobDetailAnalytics } from '@/components/JobDetailAnalytics';

// After (hydration-safe)
import { 
  HydrationSafeWebVitals, 
  HydrationSafeJobAnalytics 
} from '@/lib/hydration';
```

## Available Providers

### 1. GoogleAnalyticsProvider
- **Purpose**: Google Analytics 4 integration
- **Features**: Event tracking, page views, user properties
- **Isolation**: Minimal (needs DOM access for tracking)

### 2. OneSignalProvider  
- **Purpose**: Push notification service
- **Features**: User segmentation, notification triggers
- **Isolation**: High (extensive DOM modifications)

### 3. VercelAnalyticsProvider
- **Purpose**: Vercel Analytics integration  
- **Features**: Performance tracking, user analytics
- **Isolation**: Minimal (lightweight implementation)

### 4. WebVitalsProvider
- **Purpose**: Core Web Vitals monitoring
- **Features**: CLS, INP, FCP, LCP, TTFB tracking
- **Isolation**: None (needs performance API access)

## Configuration

### Environment Variables

```bash
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# OneSignal
NEXT_PUBLIC_ONESIGNAL_APP_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Error reporting (optional)
NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT=https://api.example.com/errors
```

### Custom Configuration

```typescript
import { createAnalyticsManager } from '@/lib/hydration';

const manager = createAnalyticsManager({
  enableDebugMode: true,
  analyticsQueueSize: 200,
  analyticsFlushInterval: 3000,
  deferredLoadDelay: 1500,
  fallbackStrategies: {
    'google-analytics': 'deferred',
    'onesignal': 'client-only',
  },
});
```

## Event Types

### Standard Events

- `page_view` - Page navigation tracking
- `apply_click` - Job application interactions  
- `search` - Search query tracking
- `social_share` - Social media sharing
- `internal_link_click` - Internal navigation
- `scroll_depth` - Engagement measurement
- `time_on_page` - Session duration
- `form_submission` - Form interactions
- `error` - Error tracking
- `web_vitals` - Performance metrics

### Custom Events

```typescript
trackEvent({
  type: 'custom_event',
  data: {
    event_category: 'user_interaction',
    event_label: 'feature_usage',
    custom_parameter: 'value',
  },
});
```

## Error Handling

### Error Types

1. **Provider Registration Errors** - Invalid provider configuration
2. **Script Loading Errors** - Network failures, blocked scripts
3. **Event Tracking Errors** - Provider-specific failures
4. **Hydration Errors** - SSR/CSR mismatches

### Recovery Strategies

- **Retry with Backoff** - For transient failures
- **Fallback Providers** - Alternative tracking methods
- **Graceful Degradation** - Continue without failed providers
- **Error Reporting** - Log issues for monitoring

## Performance Impact

### Optimizations

- **Lazy Loading** - Providers load only after hydration
- **Event Batching** - Reduces network requests
- **Memory Management** - Automatic cleanup of resources
- **Queue Limits** - Prevents memory leaks

### Metrics

- **Hydration Time** - Minimal impact on initial page load
- **Memory Usage** - Efficient event queue management  
- **Network Requests** - Batched analytics calls
- **Error Rate** - Comprehensive error tracking

## Testing

### Unit Tests

```bash
npm test -- --testPathPatterns=AnalyticsManager.test.ts
```

### Integration Tests

```bash
npm test -- --testPathPatterns=hydration
```

### Manual Testing

1. **Development Mode** - Enable debug logging
2. **Network Throttling** - Test with slow connections
3. **Script Blocking** - Verify fallback behavior
4. **Hydration Simulation** - Test SSR/CSR consistency

## Migration Guide

### From Existing Analytics

1. **Replace Components**
   ```typescript
   // Old
   <WebVitals />
   <JobDetailAnalytics {...props} />
   
   // New  
   <HydrationSafeWebVitals />
   <HydrationSafeJobAnalytics {...props} />
   ```

2. **Update Event Tracking**
   ```typescript
   // Old
   import { trackEvent } from '@/lib/analytics';
   
   // New
   import { useAnalytics } from '@/lib/hydration';
   const { trackEvent } = useAnalytics();
   ```

3. **Wrap Application**
   ```typescript
   // Add to layout.tsx
   <AnalyticsProvider>
     {children}
   </AnalyticsProvider>
   ```

### Gradual Rollout

1. **Feature Flags** - Enable for percentage of users
2. **A/B Testing** - Compare old vs new implementations
3. **Monitoring** - Track error rates and performance
4. **Rollback Plan** - Quick revert if issues arise

## Troubleshooting

### Common Issues

1. **Events Not Tracking**
   - Check provider registration
   - Verify environment variables
   - Enable debug mode

2. **Hydration Mismatches**
   - Ensure providers are properly isolated
   - Check for direct DOM manipulation
   - Verify SSR/CSR consistency

3. **Performance Issues**
   - Reduce queue size
   - Increase flush interval
   - Disable non-essential providers

### Debug Mode

```typescript
// Enable detailed logging
const manager = createAnalyticsManager({
  enableDebugMode: true,
});

// Check provider status
console.log(manager.getProvider('google-analytics')?.isLoaded());

// Monitor queue size
console.log(manager.getQueueSize());
```

## Contributing

### Adding New Providers

1. **Implement Interface**
   ```typescript
   class MyProvider implements AnalyticsProvider {
     public readonly id = 'my-provider';
     public readonly name = 'My Analytics';
     // ... implement required methods
   }
   ```

2. **Add Configuration**
   ```typescript
   // Update fallback strategies
   fallbackStrategies: {
     'my-provider': LoadingStrategy.DEFERRED,
   }
   ```

3. **Write Tests**
   ```typescript
   describe('MyProvider', () => {
     // Test provider functionality
   });
   ```

### Code Standards

- **TypeScript** - Strict type checking
- **Error Handling** - Graceful failure modes
- **Performance** - Minimal overhead
- **Testing** - Comprehensive test coverage
- **Documentation** - Clear API documentation

## License

This implementation is part of the SarkariPulse project and follows the same licensing terms.