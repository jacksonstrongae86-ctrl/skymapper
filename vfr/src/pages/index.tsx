import React, { useState, useEffect, createContext } from "react";
import LandingPage from "../components/landing/LandingPage";
import MainApp from "../components/app/MainApp";
import "intro.js/introjs.css";

// Create context to share landing state with _app.tsx
export const LandingContext = createContext<{
  showLanding: boolean;
  setShowLanding: (value: boolean) => void;
}>({
  showLanding: true,
  setShowLanding: () => {},
});

export default function Home() {
  const [showLanding, setShowLanding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has visited before
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('skymapper-has-visited');
      const urlParams = new URLSearchParams(window.location.search);
      const forceApp = urlParams.get('app') === 'true';
      const forceLanding = urlParams.get('landing') === 'true';

      if (forceApp || (hasVisited && !forceLanding)) {
        setShowLanding(false);
      } else {
        setShowLanding(true);
      }
      setIsLoading(false);
    }
  }, []);

  // Show loading state during SSR and initial client load
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show landing page for first-time visitors
  if (showLanding) {
    return <LandingPage />;
  }

  // Show main app for returning users
  return <MainApp />;
}