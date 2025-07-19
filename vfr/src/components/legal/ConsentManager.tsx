// src/components/legal/ConsentManager.tsx
import React, { useState, useEffect } from "react";
import { useTheme } from "@/src/utils/ThemeContext";
import {
  ConsentManager as ConsentUtil,
  ConsentState,
} from "../../utils/consentManager";
import { CookieConsent } from "./CookieConsent";
import { UserConsent } from "./UserConsent";
import { PolicyModal } from "./PolicyModal";
import {
  Shield,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

interface ConsentManagerProps {
  onConsentChange?: (consents: ConsentState) => void;
  showInitialModal?: boolean;
  position?: "bottom" | "top" | "center";
}

export const ConsentManagerComponent: React.FC<ConsentManagerProps> = ({
  onConsentChange,
  showInitialModal = true,
}) => {
  const { theme } = useTheme();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState<string>("");
  const [consents, setConsents] = useState<ConsentState>(
    ConsentUtil.getDefaultConsents()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [,setHasInitialized] = useState(false);

  // Initialize consent state
  useEffect(() => {
    const initializeConsents = async () => {
      setIsLoading(true);

      try {
        const savedConsents = ConsentUtil.getConsents();

        if (savedConsents) {
          setConsents(savedConsents);
          setHasInitialized(true);
        } else {
          // If no consents saved, don't show the main modal initially
          // The cookie banner will handle the first interaction
          setHasInitialized(false);
        }
      } catch (error) {
        console.error("Failed to initialize consents:", error);
        setConsents(ConsentUtil.getDefaultConsents());
        setHasInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeConsents();
  }, [showInitialModal]);

  // Listen for consent updates from other components
  useEffect(() => {
    const handleConsentUpdated = (event: CustomEvent<ConsentState>) => {
      setConsents(event.detail);
    };

    const handleConsentCleared = () => {
      setConsents(ConsentUtil.getDefaultConsents());
      setHasInitialized(false);
    };

    window.addEventListener(
      "consentUpdated",
      handleConsentUpdated as EventListener
    );
    window.addEventListener("consentCleared", handleConsentCleared);

    return () => {
      window.removeEventListener(
        "consentUpdated",
        handleConsentUpdated as EventListener
      );
      window.removeEventListener("consentCleared", handleConsentCleared);
    };
  }, []);

  const handleConsentUpdate = (newConsents: ConsentState) => {
    setConsents(newConsents);
    ConsentUtil.saveConsents(newConsents);
    onConsentChange?.(newConsents);

    // Mark as initialized when any consent is given
    setHasInitialized(true);

    // Close modals if consent is complete
    if (ConsentUtil.hasValidConsent()) {
      setShowConsentModal(false);
    }
  };

  const openPolicy = (policyType: string) => {
    setCurrentPolicy(policyType);
    setShowPolicyModal(true);
  };

  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to reset all consent preferences? This will clear all cookies and data."
      )
    ) {
      ConsentUtil.clearAllData();
      setConsents(ConsentUtil.getDefaultConsents());
      setHasInitialized(false);
    }
  };

  const handleExport = () => {
    try {
      // Get the actual consents object instead of relying on exportConsents
      const consentsData = ConsentUtil.getConsents();

      if (!consentsData) {
        alert("No consent data to export");
        return;
      }

      // Create a comprehensive export object
      const exportData = {
        consents: consentsData,
        exportedAt: new Date().toISOString(),
        version: "1.0",
        application: "SkyMapper",
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `skymapper-consent-preferences-${
        new Date().toISOString().split("T")[0]
      }.json`;

      // Ensure the element is in the DOM for some browsers
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);

      console.log("Consent data exported successfully");
    } catch (error) {
      console.error("Failed to export consent data:", error);
      alert("Failed to export consent data. Please try again.");
    }
  };

  const getConsentStatus = () => {
    const summary = ConsentUtil.getConsentSummary();
    const totalCategories = Object.keys(summary).length;
    const enabledCategories = Object.values(summary).filter(Boolean).length;

    return {
      isComplete: ConsentUtil.hasValidConsent(),
      isPartial: enabledCategories > 1 && enabledCategories < totalCategories,
      enabledCount: enabledCategories,
      totalCount: totalCategories,
      summary,
    };
  };

  const status = getConsentStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">
          <RefreshCw size={24} className="text-[var(--button-bg)]" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 dark:bg-black/20 backdrop-blur-md">
          <div
            className={`
        w-full max-w-lg sm:max-w-2xl mx-2 sm:mx-4 rounded-xl shadow-2xl border border-[var(--sidebar-border)]
        ${`gradient-${theme}`} max-h-[95vh] sm:max-h-[90vh] flex flex-col
      `}
          >
            <div className="custom-scrollbar overflow-y-auto p-4 sm:p-8">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <Shield size={32} className="text-[var(--button-text)]" />
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-[var(--sidebar-text)]">
                    Privacy & Consent Center
                  </h2>
                  <p className="text-[var(--sidebar-text)] opacity-75 mt-2">
                    Customize your privacy preferences and review our policies
                  </p>
                </div>

                {/* Status Indicator */}
                <div
                  className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  ${
                    status.isComplete
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700"
                      : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700"
                  }
                `}
                >
                  {status.isComplete ? (
                    <>
                      <CheckCircle size={16} />
                      All Set
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={16} />
                      Action Required
                    </>
                  )}
                </div>
              </div>

              {/* Consent Status Summary */}
              <div className="mb-8 p-6 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] bg-opacity-50">
                <h3 className="font-semibold text-[var(--sidebar-text)] mb-4 flex items-center gap-2">
                  <Info size={18} />
                  Current Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(status.summary).map(([key, enabled]) => (
                    <div
                      key={key}
                      className={`
                      p-3 rounded-lg border text-center
                      ${
                        enabled
                          ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20"
                      }
                    `}
                    >
                      <div
                        className={`
                        text-sm font-medium capitalize
                        ${
                          enabled
                            ? "text-green-800 dark:text-green-200"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      `}
                      >
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                      <div className="mt-1">
                        {enabled ? (
                          <CheckCircle
                            size={16}
                            className="mx-auto text-green-600 dark:text-green-400"
                          />
                        ) : (
                          <div className="w-4 h-4 mx-auto rounded-full border-2 border-gray-400 dark:border-gray-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aviation Safety Notice */}
              <div className="mb-8 p-6 rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-900/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={24}
                    className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1"
                  />
                  <div>
                    <h3 className="font-bold text-red-800 dark:text-red-200 mb-2">
                      IMPORTANT AVIATION SAFETY NOTICE
                    </h3>
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      SkyMapper is a flight planning tool only and is NOT
                      approved for actual flight operations. We do not take
                      responsibility for flight safety, weather accuracy,
                      navigation precision, or any aviation-related decisions.
                      Always verify information with official aviation
                      authorities and current NOTAMs.
                    </p>
                  </div>
                </div>
              </div>

              {/* User Consent Component */}
              <UserConsent
                consents={consents}
                onConsentChange={handleConsentUpdate}
                onOpenPolicy={openPolicy}
              />

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-[var(--sidebar-border)] flex flex-wrap gap-4 justify-between items-center">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 rounded-lg border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] hover:opacity-80 transition-all duration-200 flex items-center gap-2 text-sm"
                  >
                    <Download size={16} />
                    Export Preferences
                  </button>

                  <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:opacity-80 transition-all duration-200 flex items-center gap-2 text-sm"
                  >
                    <Trash2 size={16} />
                    Reset All
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConsentModal(false)}
                    className="px-6 py-3 rounded-lg border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] hover:opacity-80 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (status.isComplete) {
                        setShowConsentModal(false);
                      } else {
                        alert(
                          "Please accept all required agreements to continue."
                        );
                      }
                    }}
                    disabled={!status.isComplete}
                    className={`
                      px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
                      ${
                        status.isComplete
                          ? `${`button-gradient-${theme}`} text-[var(--button-text)] hover:opacity-90`
                          : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      }
                    `}
                  >
                    <CheckCircle size={18} />
                    Continue to SkyMapper
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Consent Banner */}
      {!ConsentUtil.hasValidConsent() && !showConsentModal && (
        <CookieConsent
          consents={consents}
          onConsentChange={handleConsentUpdate}
          onOpenSettings={() => setShowConsentModal(true)}
          onOpenPolicy={openPolicy}
        />
      )}

      {/* Policy Modal */}
      {showPolicyModal && (
        <PolicyModal
          policyType={currentPolicy}
          onClose={() => setShowPolicyModal(false)}
          isOpen={showPolicyModal}
        />
      )}
    </>
  );
};

// Export with alias to avoid naming conflicts
export { ConsentManagerComponent as ConsentManager };
