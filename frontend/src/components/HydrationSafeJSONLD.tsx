/**
 * HydrationSafeJSONLD Component
 * 
 * React component wrapper for JSONLDHandler that prevents hydration mismatches
 * Addresses Requirements 2.1, 2.4, 5.1 from the design document
 */

'use client';

import { useEffect, useState } from 'react';
import { jsonLDHandler } from '@/lib/hydration/JSONLDHandler';

interface HydrationSafeJSONLDProps {
  data: object;
  id: string;
  priority?: number;
  dependencies?: string[];
  onError?: (error: Error) => void;
}

export function HydrationSafeJSONLD({
  data,
  id,
  priority = 0,
  dependencies,
  onError
}: HydrationSafeJSONLDProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [serializedContent, setSerializedContent] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Mark as hydrated on client side
    setIsHydrated(true);

    try {
      // Add structured data to handler
      jsonLDHandler.addStructuredData(data, id, priority, dependencies);

      // Get serialized content for injection
      const scripts = jsonLDHandler.getSerializedScripts();
      const currentScript = scripts.find(script => script.key === id);
      
      if (currentScript) {
        setSerializedContent(currentScript.content);
      }
    } catch (error) {
      setHasError(true);
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
      console.error('[HydrationSafeJSONLD] Error processing structured data:', error);
    }

    // Cleanup on unmount
    return () => {
      jsonLDHandler.removeStructuredData(id);
    };
  }, [data, id, priority, dependencies, onError]);

  // Don't render anything during SSR to prevent hydration mismatches
  if (!isHydrated || hasError || !serializedContent) {
    return null;
  }

  // Check if dependencies are satisfied before rendering
  if (dependencies && !jsonLDHandler.areDependenciesSatisfied(id)) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializedContent }}
      suppressHydrationWarning
    />
  );
}

/**
 * Server-side safe JSON-LD component
 * Renders during SSR but uses consistent serialization
 */
interface SSRSafeJSONLDProps {
  data: object;
  id: string;
}

export function SSRSafeJSONLD({ data, id }: SSRSafeJSONLDProps) {
  // Use JSONLDHandler for consistent serialization even during SSR
  const serializedContent = jsonLDHandler.serializeData(data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializedContent }}
      suppressHydrationWarning
    />
  );
}

/**
 * Hook for managing structured data in components
 */
export function useStructuredData(data: object, id: string, priority: number = 0) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      jsonLDHandler.addStructuredData(data, id, priority);
      setIsRegistered(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsRegistered(false);
    }

    return () => {
      jsonLDHandler.removeStructuredData(id);
      setIsRegistered(false);
    };
  }, [data, id, priority]);

  const updateData = (newData: object, newPriority?: number) => {
    try {
      jsonLDHandler.updateStructuredData(id, newData, newPriority);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  return {
    isRegistered,
    error,
    updateData,
    removeData: () => jsonLDHandler.removeStructuredData(id)
  };
}