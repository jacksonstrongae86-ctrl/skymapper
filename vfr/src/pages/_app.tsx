import "../styles/globals.css";
import { ConsentManager } from "@/src/components/legal/ConsentManager";
import { ConsentState } from "@/src/utils/consentManager";
import type { AppProps } from "next/app";
import { ThemeProvider } from "../utils/ThemeContext";
import { useEffect } from "react";
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

export default function App({ Component, pageProps }: AppProps) {

   useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: '/ingest',
        ui_host: 'https://eu.posthog.com',
        defaults: '2025-05-24',
        person_profiles: 'identified_only',

        // Debug en desarrollo
        loaded: (posthog) => {
          console.log('✅ PostHog loaded via proxy - no more ad blocker issues!');
          if (process.env.NODE_ENV === 'development') {
            posthog.debug();
          }
        }
      });
    }

    // Tu otra inicialización
    fetch('/api/sync/initialize', { method: 'POST' })
      .then(res => res.json())
      .then(data => console.log('Sync service initialized:', data))
      .catch(error => console.error('Failed to initialize sync service:', error));
  }, []);

  // Handle consent changes (optional - for analytics setup, etc.)
  const handleConsentChange = (consents: ConsentState) => {
    console.log('User consent updated:', consents);

    // You can add analytics initialization here based on consent
    if (consents.analytics) {
      // Initialize Google Analytics or other analytics
      console.log('Analytics enabled');
    }

    if (consents.marketing) {
      // Initialize marketing pixels
      console.log('Marketing cookies enabled');
    }
  };

  return (
    <PostHogProvider client={posthog}>
    <ThemeProvider>
      <Component {...pageProps} />
      <ConsentManager
        showInitialModal={true}
        position="center"
        onConsentChange={handleConsentChange}
      />
    </ThemeProvider>
    </PostHogProvider>
  );
}
