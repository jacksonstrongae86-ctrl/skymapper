import "../styles/globals.css";
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

  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
