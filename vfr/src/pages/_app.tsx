import "../styles/globals.css";
import { ConsentManager } from "@/src/components/legal/ConsentManager";
import { ConsentState } from "@/src/utils/consentManager";
import type { AppProps } from "next/app";
import { ThemeProvider } from "../utils/ThemeContext";
import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      const savedConsents = localStorage.getItem("skymapper-consents");
      let hasAnalyticsConsent = false;

      if (savedConsents) {
        try {
          const parsedConsents = JSON.parse(savedConsents);
          handleConsentChange(parsedConsents as ConsentState)
          hasAnalyticsConsent = parsedConsents.analytics === true;
        } catch (error) {
          console.error("Error parsing saved consents:", error);
        }
      } else {
        console.warn("No consents found");
      }

      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: "/ingest",
        ui_host: "/ingest",

        opt_out_capturing_by_default: !hasAnalyticsConsent,
        persistence: hasAnalyticsConsent ? "localStorage+cookie" : "memory",
        request_batching: false,
        feature_flag_request_timeout_ms: 10000,
        disable_session_recording: true,
        capture_pageview: hasAnalyticsConsent,
        capture_pageleave: hasAnalyticsConsent,
        autocapture: true,
        person_profiles: "identified_only",

        on_request_error: (error) => {
          console.error("PostHog request error:", error);
        },

        loaded: (posthogInstance) => {
          if (process.env.NODE_ENV === "development") {
            posthogInstance.debug();
          } else {
            posthogInstance.debug(false);
          }
        },
      });
    } else {
    }

    fetch("/api/sync/initialize", { method: "POST" })
      .then((res) => res.json())
      .catch((error) =>
        console.error("Failed to initialize sync service:", error)
      );

  }, []);

  const handleConsentChange = (consents: ConsentState) => {
    if (consents.analytics) {
      posthog.opt_in_capturing();
      posthog.set_config({
        persistence: "localStorage+cookie",
        capture_pageview: true,
        capture_pageleave: true,
      });
    } else {
      posthog.opt_out_capturing();
      posthog.set_config({
        persistence: "memory",
        capture_pageview: false,
        capture_pageleave: false,
      });
    }
    // Opcional: tracking de cambio de consentimiento
    posthog.capture("consent_changed", {
      analytics: consents.analytics,
      marketing: consents.marketing,
      timestamp: new Date().toISOString(),
    });
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
