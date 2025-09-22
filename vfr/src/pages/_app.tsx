import "../styles/globals.css";
import { ConsentManager } from "@/src/components/legal/ConsentManager";
import { ConsentState } from "@/src/utils/consentManager";
import type { AppProps } from "next/app";
import { ThemeProvider } from "../utils/ThemeContext";
import { useEffect, useState, useCallback } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import LoadingPage from "../components/LoadingPage";
import "intro.js/introjs.css";
import { useIsMobile } from "../hooksMobile/useIsMobile";

export default function App({ Component, pageProps }: AppProps) {
  const [initialized, setInitialized] = useState(false);
  const [tutorialType, setTutorialType] = useState<"desktop" | "mobile" | null>(
    null
  );

  const isMobile = useIsMobile();
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

  // Separate function to check tutorial eligibility
  const checkTutorialEligibility = useCallback((consents: ConsentState) => {
    if (
      consents.analytics &&
      localStorage.getItem("skymapper-tutorial-completed") == null
    ) {
      localStorage.setItem("skymapper-tutorial-candidate", "true");
    }
  }, []);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      console.warn("PostHog key not found, analytics disabled");
      setInitialized(true);
      return;
    }

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: "https://eu.i.posthog.com",
      ui_host: "https://eu.i.posthog.com",
      opt_out_capturing_by_default: true,
      persistence: "memory",
      request_batching: false,
      feature_flag_request_timeout_ms: 10000,
      disable_session_recording: false,
      session_recording: {
        maskAllInputs: false,
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
          instance.debug(false);
        }

        const savedConsents = localStorage.getItem("skymapper-consents");
        if (savedConsents) {
          try {
            const parsedConsents = JSON.parse(savedConsents);
            applyConsent(parsedConsents);
            // ✅ Also check tutorial eligibility when loading saved consents
            checkTutorialEligibility(parsedConsents);
          } catch (error) {
            console.error("Error parsing saved consents:", error);
          }
        } else {
          console.warn("No consents found");
        }

        setInitialized(true);
      },
    });

    fetch("/api/sync/initialize", { method: "POST" })
      .then((res) => res.json())
      .catch((error) =>
        console.error("Failed to initialize sync service:", error)
      );
  }, [applyConsent, checkTutorialEligibility]);

  const handleConsentChange = (consents: ConsentState) => {
    applyConsent(consents);
    // ✅ Check tutorial eligibility when consent changes
    checkTutorialEligibility(consents);
  };

  const desktopTutorial = useCallback(
    (introJs: typeof import("intro.js").default) => {
      introJs.tour()
        .setOptions({
          steps: [
            {
              intro:
                "Welcome to Skymapper! This interactive flight planning tool helps you create and manage flight routes with real-time calculations and aviation data.",
            },
            {
              element: document.querySelector("#search-button"),
              intro:
                "Search for any location worldwide to add as a waypoint to your flight route.",
              position: "right",
            },
            {
              element: document.querySelector("#map-type-selector"),
              intro:
                "Switch between different map views: Street, Satellite, Hybrid, or Terrain to suit your planning needs.",
              position: "right",
            },
            {
              element: document.querySelector("#country-selector"),
              intro:
                "Select your country to load relevant aviation data including airports, airspaces, and navigation aids.",
              position: "right",
            },
            {
              element: document.querySelector("#aviation-data-toggle"),
              intro:
                "Toggle aviation layers on/off including airports, airspaces, navigation aids, obstacles, and hotspots.",
              position: "right",
            },
            {
              element: document.querySelector("#route-manager"),
              intro:
                "Save, load, and manage your flight routes. Share routes with others using generated links.",
              position: "right",
            },
            {
              element: document.querySelector("#delete-last-waypoint"),
              intro: "Remove the last waypoint you added to your route.",
              position: "right",
            },
            {
              element: document.querySelector("#clear-waypoints"),
              intro:
                "Clear all waypoints and start planning a new route from scratch.",
              position: "right",
            },
            {
              element: document.querySelector("#main-sidebar"),
              intro:
                "This is where the magic happens. Everything a pilot would dream for the configuration of a route.",
              position: "left",
            },
            {
              element: document.querySelector("#flight-settings"),
              intro:
                "Configure your flight settings including aircraft performance, fuel consumption, and weather data",
              position: "left",
            },
            {
              element: document.querySelector("#waypoints-section"),
              intro:
                "View and manage all your waypoints. Click on waypoints to edit coordinates, change types, or delete them.",
              position: "left",
            },
            {
              element: document.querySelector("#map-container"),
              intro:
                "Click anywhere on the map to add waypoints. Your flight path will automatically connect them in order.",
              position: "top",
            },
            {
              element: document.querySelector("#bottom-sidebar"),
              intro:
                "View detailed flight calculations including distances, headings, fuel consumption, and estimated flight times.",
              position: "top",
            },
            {
              element: document.querySelector("#results-table"),
              intro:
                "Detailed leg-by-leg breakdown of your flight with track, heading, distance, and fuel calculations.",
              position: "top",
            },
            {
              element: document.querySelector("#flight-totals"),
              intro:
                "Summary of your complete flight: total distance, flight time, and fuel required.",
              position: "top",
            },
            {
              intro:
                "That's it! Start by clicking on the map to add waypoints and create your flight plan. Happy flying! ✈️",
            },
          ],
          showProgress: true,
          showBullets: true,
          exitOnOverlayClick: false,
          showStepNumbers: false,
          nextLabel: "Next",
          prevLabel: "Back",
          skipLabel: "Skip",
          doneLabel: "Start Planning!",
          highlightClass: "introjs-helperNumberLayer",
          tooltipClass: "theme-dark",
        })
        .onBeforeChange((targetElement: Element) => {
          // Apply theme styling
          setTimeout(() => {
            document
              .querySelectorAll(".introjs-tooltip")
              .forEach((el) => el.classList.add("theme-dark"));
          }, 10);

          // Custom logic based on the target element
          const elementId = targetElement?.id;

          // Adjust tooltip position or content based on element
          if (elementId === "map-container") {
            // Special handling for map step
            console.log("About to highlight the map");
          } else if (elementId === "search-button") {
            // Special handling for search button
            console.log("About to highlight search");
          }

          // You could also modify the step content dynamically
          // or perform animations before the step shows

          // Return true to continue, false to prevent the step change
          return true;
        })
        .onComplete(() => {
          localStorage.setItem("skymapper-tutorial-completed", "true");
        })
        .onExit(() => {
          localStorage.setItem("skymapper-tutorial-completed", "true");
        })
        .start();
    },
    []
  );

  const mobile2ndTutorial = useCallback(
    (introJs: typeof import("intro.js").default) => {
      introJs.tour()
        .setOptions({
          steps: [
            {
              element: "#map-menu-button",
              intro:
                "Tap here to access search, map types, aviation data, and route management.",
              position: "right",
            },
            {
              element: "#mobile-map-close-button",
              intro:
                "Tap here to exit the expanded map view and return to the full interface.",
              position: "right",
            },
            {
              element: "#mobile-bottom-sidebar > div",
              intro:
                "This section shows your flight calculations: distance, track, heading, GS, time, and fuel.",
              position: "top",
            },
            {
              intro:
                "That’s it! Add waypoints on the map and let Skymapper calculate your flight. Happy flying! ✈️",
            },
          ],
          showProgress: true,
          showBullets: false,
          exitOnOverlayClick: false,
          showStepNumbers: false,
          nextLabel: "Next",
          prevLabel: "Back",
          skipLabel: "Skip",
          doneLabel: "Start Planning!",
          highlightClass: "introjs-helperNumberLayer",
          tooltipClass: "theme-dark",
        })
        .onBeforeChange((targetElement: Element) => {
          // Apply theme styling
          setTimeout(() => {
            document
              .querySelectorAll(".introjs-tooltip")
              .forEach((el) => el.classList.add("theme-dark"));
          }, 10);

          // Custom logic based on the target element
          const elementId = targetElement?.id;

          if (elementId === "map-menu-button") {
            // Ensure the map menu button is visible
            const menuButton = document.querySelector(
              "#map-menu-button"
            ) as HTMLElement;
            // click it to open the menu
            menuButton?.click();
          }
          return true;
        })
        .onAfterChange(function (targetElement: Element) {
          if (!targetElement)
            return undefined;

          // if (targetElement.parentElement?.id === "mobile-map-close-button") {
          //   const MapContainer = document.querySelector(
          //     "#map-container"
          //   ) as HTMLElement;
          //   // click it to close the expanded map
          //   MapContainer?.click();
          // }
          // // When the bottom sidebar step is shown, we need to close the expanded map.
          // // The targetElement is the `div` inside `#mobile-bottom-sidebar`, so we check its parent's ID.
          // if (targetElement.parentElement?.id === "mobile-bottom-sidebar") {
          //   const closeButton = document.querySelector(
          //     "#mobile-map-close-button"
          //   ) as HTMLElement;
          //   // click it to close the expanded map
          //   closeButton?.click();
          // }
        })
        .onComplete(() => {
          localStorage.setItem("skymapper-mobile-2nd-tutorial-completed", "true");
        })
        .onExit(() => {
          localStorage.setItem("skymapper-mobile-2nd-tutorial-completed", "true");
        })
        .start();
    },
    []
  );


  const mobileTutorial = useCallback(
    (introJs: typeof import("intro.js").default) => {
      const tour = introJs.tour();
      tour
        .setOptions(
          {
          steps: [
            {
              intro:
                "Welcome to Skymapper (Mobile)! This guide will show you how to plan flights efficiently on your phone.",
            },
            {
              element: "#mobile-top-sidebar > div",
              intro:
                "Tap here to configure your flight: fuel consumption, performance, and weather data.",
              // place tooltip below the resize handle
              position: "bottom",
            },
            {
              element: "#waypoints-tab",
              intro:
                "Switch to the Waypoints tab to view, edit, or delete your route’s waypoints.",
              position: "bottom",
              // show the whole sidebar
            },
            {
              element: "#map-container",
              intro:
                "Tap anywhere on the map to add waypoints. The route will connect them in order.",
              position: "top",
            },
          ],
          showProgress: true,
          showBullets: false,
          exitOnOverlayClick: false,
          showStepNumbers: false,
          nextLabel: "Next",
          prevLabel: "Back",
          skipLabel: "Skip",
          doneLabel: "Next",
          tooltipClass: "theme-dark",
          scrollToElement: false,
        })
        .onBeforeChange(() => {
          setTimeout(() => {
            document
              .querySelectorAll(".introjs-tooltip")
              .forEach((el) => el.classList.add("theme-dark"));
          }, 10);
          return true;
        })
        .onAfterChange(function (targetElement: Element) {
           if (!targetElement) return undefined;

           // When the map step is shown, click it to expand it.
           if (targetElement.id === "map-container") {
             console.log("Clicking the map in mobile tutorial to expand it.");
             (targetElement.firstElementChild as HTMLElement)?.click();
            }
        })
        .onComplete(() => {
          // initialize the next tutorial
          mobile2ndTutorial(introJs);
          localStorage.setItem("skymapper-mobile-tutorial-completed", "true");
        })
        .onExit(() => {
          localStorage.setItem("skymapper-mobile-tutorial-completed", "true");
        })
        .start();
    },
    [mobile2ndTutorial]
  );


  // On initialization and device detection, set tutorialType string
  useEffect(() => {
    if (initialized) {
      setTutorialType(isMobile ? "mobile" : "desktop");
    }
  }, [initialized, isMobile]);

  // Only after initialized and tutorialType is set, lazy-load intro.js and run tutorial
  useEffect(() => {
    if (initialized && tutorialType) {
      console.log(
        "candidate: ",
        localStorage.getItem("skymapper-tutorial-candidate")
      );
      if (
        typeof window !== "undefined" &&
        localStorage.getItem("skymapper-tutorial-candidate")
      ) {
        localStorage.removeItem("skymapper-tutorial-candidate");
        import("intro.js").then((introModule) => {
          const introJs = introModule.default;
          setTimeout(() => {
            if (tutorialType === "mobile") {
              mobileTutorial(introJs);
            } else {
              desktopTutorial(introJs);
            }
          }, 1000);
        });
      }
    }
  }, [initialized, tutorialType, mobileTutorial, desktopTutorial]);

  if (!initialized) {
    return <LoadingPage />;
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
