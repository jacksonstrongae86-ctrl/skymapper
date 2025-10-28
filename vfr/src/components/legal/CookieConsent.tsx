// src/components/legal/CookieConsent.tsx
import React, { useState, useEffect } from "react";
import { ConsentState } from "../../utils/consentManager";
import { CookieUtils } from "../../utils/cookieUtils";
import {
  Cookie,
  Settings,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Shield,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "@/src/utils/ThemeContext";

interface CookieConsentProps {
  consents: ConsentState;
  onConsentChange: (consents: ConsentState) => void;
  onOpenSettings: () => void;
  onOpenPolicy?: (policyType: string) => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({
  consents,
  onConsentChange,
  onOpenSettings,
  onOpenPolicy,
}) => {
  const { theme } = useTheme();
  const [showBanner, setShowBanner] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const consentGiven = localStorage.getItem("skymapper-cookie-consent");
    const bannerDismissed = localStorage.getItem("skymapper-banner-dismissed");

    if (!consentGiven && !bannerDismissed) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    setIsAnimating(true);

    const newConsents: ConsentState = {
      ...consents,
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      termsAccepted: true,
      privacyAccepted: true,
      dataProcessingAccepted: true,
      timestamp: new Date().toISOString(),
      version: "1.0",
    };

    onConsentChange(newConsents);
    localStorage.setItem("skymapper-cookie-consent", "accepted-all");

    // Set individual consent cookies
    CookieUtils.setConsentCookie("necessary", true);
    CookieUtils.setConsentCookie("analytics", true);
    CookieUtils.setConsentCookie("marketing", true);
    CookieUtils.setConsentCookie("preferences", true);

    setTimeout(() => {
      setShowBanner(false);
    }, 500);
  };

  const handleAcceptNecessary = () => {
    setIsAnimating(true);

    const newConsents: ConsentState = {
      ...consents,
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      termsAccepted: true,
      privacyAccepted: true,
      dataProcessingAccepted: true,
      timestamp: new Date().toISOString(),
      version: "1.0",
    };

    onConsentChange(newConsents);
    localStorage.setItem("skymapper-cookie-consent", "necessary-only");

    // Set individual consent cookies
    CookieUtils.setConsentCookie("necessary", true);
    CookieUtils.setConsentCookie("analytics", false);
    CookieUtils.setConsentCookie("marketing", false);
    CookieUtils.setConsentCookie("preferences", false);

    setTimeout(() => {
      setShowBanner(false);
    }, 500);
  };

  const handleDismiss = () => {
    localStorage.setItem("skymapper-banner-dismissed", "true");
    setIsAnimating(true);
    setTimeout(() => {
      setShowBanner(false);
    }, 300);
  };

  if (!showBanner) return null;

  const cookieBreakdown = [
    {
      type: "Necessary",
      count: "~5 cookies",
      purpose: "Authentication, security, basic functionality",
      icon: Shield,
      color: "text-green-400",
    },
    {
      type: "Analytics",
      count: "~3 cookies",
      purpose: "Usage statistics, performance monitoring",
      icon: Cookie,
      color: "text-blue-400",
    },
    {
      type: "Marketing",
      count: "~4 cookies",
      purpose: "Personalization, targeted content",
      icon: Cookie,
      color: "text-purple-400",
    },
    {
      type: "Preferences",
      count: "~2 cookies",
      purpose: "Settings, theme, language preferences",
      icon: Cookie,
      color: "text-orange-400",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-[98vw] sm:max-w-[38vw] bg-gray-900 text-gray-100 border border-gray-700 shadow-xl overflow-y-auto max-h-[95vh] custom-scrollbar p-2 sm:p-8 rounded-xl sm:rounded-xl">
        <div
          className={`
            rounded-xl shadow-2xl border border-[var(--sidebar-border)] backdrop-blur-sm
            transform transition-all duration-500 ease-out
            ${`gradient-${theme}`}
            ${
              isAnimating
                ? "translate-y-2 opacity-90"
                : "translate-y-0 opacity-100"
            }
          `}
        >
          {/* Aviation Warning Banner */}
          <div className="bg-blue-700 text-white px-4 py-2 rounded-t-xl">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle size={16} />
              <span className="font-medium">
                SkyMapper is for flight planning only - not approved for actual
                navigation
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-4">
              <Cookie
                size={28}
                className="text-[var(--button-text)] flex-shrink-0 mt-1"
              />

              <div className="flex-1">
                <h3 className="text-xl font-bold text-[var(--sidebar-text)] mb-2">
                  We use cookies to enhance your flight planning experience
                </h3>

                <p className="text-[var(--sidebar-text)] text-sm mb-4 leading-relaxed">
                  SkyMapper uses cookies and similar technologies to provide
                  essential functionality, analyze usage patterns, and deliver
                  personalized content. You can customize your preferences or
                  accept all cookies to continue with the best experience.
                </p>

                {/* Cookie Breakdown - Expandable */}
                {isExpanded && (
                  <div className="mb-4 p-4 rounded-lg bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-[var(--sidebar-border)]">
                    <h4 className="font-semibold text-[var(--sidebar-text)] mb-3 flex items-center gap-2">
                      <Cookie size={16} />
                      Cookie Breakdown
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {cookieBreakdown.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.type}
                            className="flex items-start gap-2"
                          >
                            <Icon
                              size={14}
                              className={`${item.color} mt-1 flex-shrink-0`}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-[var(--sidebar-text)] text-sm">
                                  {item.type}
                                </span>
                                <span className="text-xs text-[var(--sidebar-text)] opacity-60">
                                  {item.count}
                                </span>
                              </div>
                              <p className="text-xs text-[var(--sidebar-text)] opacity-75">
                                {item.purpose}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 items-start">
                  {/* Primary button */}
                  <button
                    onClick={handleAcceptAll}
                    disabled={isAnimating}
                    className={`
                      px-8 py-3.5 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center gap-2
                      ${`button-gradient-${theme}`} text-[var(--button-text)]
                      hover:opacity-90 hover:shadow-lg transform hover:scale-105
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                    `}
                  >
                    <Check size={20} />
                    Accept All Cookies
                  </button>

                  {/* Secondary buttons row */}
                  <div className="flex flex-wrap gap-3 items-center">
                    <button
                      onClick={handleAcceptNecessary}
                      disabled={isAnimating}
                      className="
                        px-3 py-1.5 rounded-lg border border-[var(--sidebar-border)]
                        bg-[var(--sidebar-bg)] text-[var(--sidebar-text)]
                        hover:bg-opacity-80 transition-all duration-200 flex items-center gap-1.5
                        text-sm disabled:opacity-50 disabled:cursor-not-allowed
                      "
                    >
                      <X size={14} />
                      Necessary Only
                    </button>

                    <button
                      onClick={onOpenSettings}
                      disabled={isAnimating}
                      className="
                        px-3 py-1.5 rounded-lg border border-[var(--sidebar-border)]
                        bg-[var(--sidebar-bg)] text-[var(--sidebar-text)]
                        hover:bg-opacity-80 transition-all duration-200 flex items-center gap-1.5
                        text-sm disabled:opacity-50 disabled:cursor-not-allowed
                      "
                    >
                      <Settings size={14} />
                      Customize
                    </button>

                    {/* View Details Toggle */}
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="
                        px-3 py-2.5 text-[var(--sidebar-text)] opacity-75
                        hover:underline hover:scale-105
                        transition-all duration-200 flex items-center gap-1 text-sm
                      "
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp size={16} />
                          Less Details
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          More Details
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Policy Links */}
                <div className="mt-4 pt-3 border-t border-[var(--sidebar-border)] border-opacity-30">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <button
                      onClick={() => onOpenPolicy?.("privacy")}
                      className="text-[var(--button-bg)] hover:opacity-75 transition-opacity flex items-center gap-1"
                    >
                      <Eye size={14} />
                      Privacy Policy
                    </button>
                    <button
                      onClick={() => onOpenPolicy?.("cookie")}
                      className="text-[var(--button-bg)] hover:opacity-75 transition-opacity flex items-center gap-1"
                    >
                      <Eye size={14} />
                      Cookie Policy
                    </button>
                    <button
                      onClick={() => onOpenPolicy?.("terms")}
                      className="text-[var(--button-bg)] hover:opacity-75 transition-opacity flex items-center gap-1"
                    >
                      <Eye size={14} />
                      Terms of Service
                    </button>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="
                  p-2 rounded-full hover:bg-white hover:bg-opacity-10
                  transition-colors duration-200 text-[var(--sidebar-text)]
                  opacity-60 hover:opacity-100
                "
                title="Dismiss banner (you can still access settings later)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress Bar for Animation */}
            {isAnimating && (
              <div className="mt-4">
                <div className="h-1 bg-[var(--sidebar-border)] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${`button-gradient-${theme}`} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
