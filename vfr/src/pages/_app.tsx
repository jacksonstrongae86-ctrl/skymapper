import "../styles/globals.css";
import { ConsentManager } from "@/src/components/legal/ConsentManager";
import { ConsentState } from "@/src/utils/consentManager";
import type { AppProps } from "next/app";
import { ThemeProvider } from "../utils/ThemeContext";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
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
    <ThemeProvider>
      <Component {...pageProps} />
      <ConsentManager
        showInitialModal={true}
        position="center"
        onConsentChange={handleConsentChange}
      />
    </ThemeProvider>
  );
}
