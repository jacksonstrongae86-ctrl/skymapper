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

      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: "/ingest",
        ui_host: "/ingest",

        // Configuración específica para producción
        opt_out_capturing_by_default: true, // Respetar consentimiento
        persistence: "memory", // Iniciar sin cookies

        // Configuración de red más permisiva para producción
        request_batching: true,
        // Timeouts más largos para redes lentas
        feature_flag_request_timeout_ms: 10000,

        // Manejo de errores mejorado
        on_request_error: (error) => {
          console.error("PostHog request error:", error);
        },

        loaded: (posthogInstance) => {

          // Solo debug en desarrollo
          if (process.env.NODE_ENV === "production") {
            posthogInstance.debug();
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
