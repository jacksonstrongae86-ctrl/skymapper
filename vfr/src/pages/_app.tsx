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
      const savedConsents = localStorage.getItem('skymapper-consents');
      let hasAnalyticsConsent = false;

      if (savedConsents) {
        try {
          const parsedConsents = JSON.parse(savedConsents);
          hasAnalyticsConsent = parsedConsents.analytics === true;
        } catch (error) {
          console.error('Error parsing saved consents:', error);
        }
      }

      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: '/ingest',
        ui_host: '/ingest',

        opt_out_capturing_by_default: !hasAnalyticsConsent,
        persistence: hasAnalyticsConsent ? 'localStorage+cookie' : 'memory',

        disable_session_recording: false,
        session_recording: {
          maskAllInputs: false,
          maskInputOptions: {
            password: true,
            email: true
          }
        },

        capture_pageview: hasAnalyticsConsent,
        capture_pageleave: hasAnalyticsConsent,
        autocapture: true,

        person_profiles: 'identified_only',

        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            posthog.debug();
          }
        }
      });
    }

    fetch('/api/sync/initialize', { method: 'POST' })
      .then(res => res.json())
      .catch(error => console.error('Failed to initialize sync service:', error));
  }, []);

  const handleConsentChange = (consents: ConsentState) => {
    if (consents.analytics) {
    }
    if (consents.marketing) {
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
