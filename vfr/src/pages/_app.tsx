import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "../utils/ThemeContext";
import { useEffect } from "react";
import { startDailySync } from "../services/dailySync";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      startDailySync();
    }
  }, []);
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
