import "../styles/globals.css";
import { ConsentManager } from "@/src/components/legal/ConsentManager";
import { ConsentState } from "@/src/utils/consentManager";
import type { AppProps } from "next/app";
import { ThemeProvider } from "../utils/ThemeContext";
import { useEffect, useState, useCallback } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

export default function App({ Component, pageProps }: AppProps) {
  const [initialized, setInitialized] = useState(false);

  // Función para aplicar estado de consentimiento a PostHog
  const applyConsent = useCallback((consents: ConsentState) => {
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

    // Evento para registrar cambios de consentimiento
    posthog.capture("consent_changed", {
      analytics: consents.analytics,
      marketing: consents.marketing,
      timestamp: new Date().toISOString(),
    });
  }, []);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      // console.error("❌ NEXT_PUBLIC_POSTHOG_KEY not found");
      return;
    }

    // Inicializa PostHog en cualquier caso, pero con opt_out temporal hasta conocer el consentimiento
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: "https://eu.i.posthog.com",
      ui_host: "https://eu.i.posthog.com",
      opt_out_capturing_by_default: true, // Por defecto no captura nada hasta consentimiento
      persistence: "memory", // Por defecto no almacena localStorage aún
      request_batching: false,
      feature_flag_request_timeout_ms: 10000,
      disable_session_recording: false,
      session_recording: {
        maskAllInputs: true,
      },
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      person_profiles: "identified_only",

      on_request_error: () => {
        // console.error("PostHog request error:", error);
      },

      loaded: (instance) => {
        if (process.env.NODE_ENV === "development") {
          instance.debug();
        }

        // Luego de inicializar PostHog, cargar consentimiento guardado y aplicar
        const savedConsents = localStorage.getItem("skymapper-consents");
        if (savedConsents) {
          try {
            const parsedConsents = JSON.parse(savedConsents);
            applyConsent(parsedConsents);
          } catch (error) {
            console.error("Error parsing saved consents:", error);
          }
        } else {
          console.warn("No consents found");
        }

        setInitialized(true);
      },
    });

    // Inicialización adicional o fetches que necesites
    fetch("/api/sync/initialize", { method: "POST" })
      .then((res) => res.json())
      .catch((error) =>
        console.error("Failed to initialize sync service:", error)
      );
  }, [applyConsent]);

  const handleConsentChange = (consents: ConsentState) => {
    // Al cambiar consentimientos, actualiza la configuración PostHog
    applyConsent(consents);
  };

  // Opcional: puedes renderizar un loading antes de que PostHog inicialice
  if (!initialized) {
    return <div>Loading analytics...</div>;
  }

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
