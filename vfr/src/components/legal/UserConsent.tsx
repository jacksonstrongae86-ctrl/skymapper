// src/components/legal/UserConsent.tsx
import React, { Key } from "react";
import { ConsentState } from "../../utils/consentManager";
import { ToggleSwitch } from "./ToggleSwitch";
import {
  Shield,
  Database,
  BarChart,
  Target,
  Settings2,
  FileText,
  Eye,
  Info,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface UserConsentProps {
  consents: ConsentState;
  onConsentChange: (consents: ConsentState) => void;
  onOpenPolicy: (policyType: string) => void;
}

export const UserConsent: React.FC<UserConsentProps> = ({
  consents,
  onConsentChange,
  onOpenPolicy,
}) => {

  const handleToggle = (key: keyof ConsentState, value: boolean) => {
    if (key === "necessary") return; // Necessary cookies cannot be disabled

    const newConsents = {
      ...consents,
      [key]: value,
      timestamp: new Date().toISOString(),
    };
    onConsentChange(newConsents);
  };

  const consentCategories = [
    {
      key: "necessary" as keyof ConsentState,
      title: "Necessary Cookies",
      description: "Essential for the basic functionality of SkyMapper. These cookies enable core features like login, security, and basic navigation. They cannot be disabled.",
      details: [
        "Authentication and session management",
        "Security and fraud prevention",
        "Basic functionality and navigation",
        "Error logging and debugging"
      ],
      icon: Shield,
      required: true,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    },
    {
      key: "analytics" as keyof ConsentState,
      title: "Analytics Cookies",
      description: "Help us understand how you use SkyMapper to improve our service. These cookies collect anonymous usage statistics and performance data.",
      details: [
        "Page views and user interactions",
        "Performance and loading times",
        "Feature usage statistics",
        "Anonymous demographic data"
      ],
      icon: BarChart,
      required: false,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    },
    {
      key: "marketing" as keyof ConsentState,
      title: "Marketing Cookies",
      description: "Used to show you relevant content and advertisements. These help us deliver personalized experiences and measure campaign effectiveness.",
      details: [
        "Personalized content recommendations",
        "Targeted advertisements",
        "Marketing campaign tracking",
        "Social media integration"
      ],
      icon: Target,
      required: false,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    },
    {
      key: "preferences" as keyof ConsentState,
      title: "Preference Cookies",
      description: "Remember your settings and preferences for a better experience. These cookies store your theme, language, and other customization options.",
      details: [
        "Theme and appearance settings",
        "Language preferences",
        "Dashboard customizations",
        "Saved flight configurations"
      ],
      icon: Settings2,
      required: false,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
    },
  ];

  const legalConsents = [
    {
      key: "termsAccepted" as keyof ConsentState,
      title: "Terms of Service",
      description: "I agree to the Terms of Service and understand the limitations of SkyMapper as a flight planning tool.",
      policy: "terms",
      icon: FileText,
      required: true,
      warning: "Required: SkyMapper is for planning only, not certified for actual flight navigation.",
    },
    {
      key: "privacyAccepted" as keyof ConsentState,
      title: "Privacy Policy",
      description: "I acknowledge the Privacy Policy and understand how my personal data is collected, used, and protected.",
      policy: "privacy",
      icon: Shield,
      required: true,
      warning: "Required: Understanding data handling is essential for GDPR compliance.",
    },
    {
      key: "dataProcessingAccepted" as keyof ConsentState,
      title: "Data Processing Agreement",
      description: "I consent to the processing of my personal data as described in our data protection policies.",
      policy: "data-protection",
      icon: Database,
      required: true,
      warning: "Required: Legal basis for processing personal data under GDPR.",
    },
  ];

  const isLegalConsentComplete = legalConsents.every(consent =>
    consents[consent.key] as boolean
  );

  return (
    <div className="space-y-8">
      {/* Aviation Safety Warning */}
      <div className="p-4 rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-900/20">
        <div className="flex items-start gap-3">
          <AlertTriangle size={24} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-red-800 dark:text-red-200 mb-2">
              IMPORTANT AVIATION SAFETY NOTICE
            </h3>
            <p className="text-red-700 dark:text-red-300 text-sm">
              SkyMapper is a flight planning tool only and is NOT approved for actual flight operations.
              Always verify all information with official aviation authorities, current NOTAMs, and certified navigation equipment.
            </p>
          </div>
        </div>
      </div>

      {/* Cookie Consents */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Database size={24} className="text-[var(--sidebar-text)]" />
          <div>
            <h3 className="text-xl font-semibold text-[var(--sidebar-text)]">
              Cookie Preferences
            </h3>
            <p className="text-sm text-[var(--sidebar-text)] opacity-75">
              Customize how we use cookies to enhance your SkyMapper experience
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {consentCategories.map((category) => {
            const Icon = category.icon;
            const isEnabled = consents[category.key] as boolean;

            return (
              <div
                key={category.key as Key}
                className={`rounded-xl border-2 transition-all duration-200 ${
                  isEnabled
                    ? category.bgColor
                    : 'border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon
                          size={20}
                          className={isEnabled ? category.color : 'text-[var(--sidebar-text)]'}
                        />
                        <h4 className="font-semibold text-[var(--sidebar-text)]">
                          {category.title}
                        </h4>
                        {category.required && (
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full border border-green-300 dark:border-green-700">
                            Required
                          </span>
                        )}
                        {isEnabled && !category.required && (
                          <CheckCircle size={16} className={category.color} />
                        )}
                      </div>
                      <p className="text-[var(--sidebar-text)] opacity-75 mb-3">
                        {category.description}
                      </p>

                      {/* Expandable details */}
                      <details className="group">
                        <summary className="cursor-pointer text-sm text-[var(--button-bg)] hover:opacity-75 transition-opacity flex items-center gap-1">
                          <Info size={14} />
                          What data is collected?
                        </summary>
                        <div className="mt-2 p-3 rounded-lg bg-white dark:bg-gray-800 border border-[var(--sidebar-border)]">
                          <ul className="text-sm text-[var(--sidebar-text)] space-y-1">
                            {category.details.map((detail, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--button-bg)] flex-shrink-0"></span>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </details>
                    </div>

                    <div className="ml-4">
                      <ToggleSwitch
                        checked={isEnabled}
                        onChange={(value) => handleToggle(category.key, value)}
                        disabled={category.required}
                        size="md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legal Consents */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <FileText size={24} className="text-[var(--sidebar-text)]" />
          <div>
            <h3 className="text-xl font-semibold text-[var(--sidebar-text)]">
              Legal Agreements
            </h3>
            <p className="text-sm text-[var(--sidebar-text)] opacity-75">
              Required agreements to use SkyMapper services
            </p>
          </div>
          {isLegalConsentComplete && (
            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
          )}
        </div>

        <div className="space-y-4">
          {legalConsents.map((consent) => {
            const Icon = consent.icon;
            const isAccepted = consents[consent.key] as boolean;

            return (
              <div
                key={consent.key as Key}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  isAccepted
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                    : 'border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon size={18} className="text-[var(--sidebar-text)]" />
                      <h4 className="font-semibold text-[var(--sidebar-text)]">
                        {consent.title}
                      </h4>
                      <button
                        onClick={() => onOpenPolicy(consent.policy)}
                        className={`p-1 rounded-full hover:bg-[var(--button-bg)] hover:bg-opacity-10 transition-colors ${`text-[var(--button-bg)]`}`}
                        title={`View ${consent.title}`}
                      >
                        <Eye size={16} />
                      </button>
                      <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full border border-red-300 dark:border-red-700">
                        Required
                      </span>
                      {isAccepted && (
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <p className="text-[var(--sidebar-text)] opacity-75 text-sm mb-2">
                      {consent.description}
                    </p>
                    <div className="text-xs text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800">
                      <strong>Note:</strong> {consent.warning}
                    </div>
                  </div>

                  <div className="ml-4">
                    <ToggleSwitch
                      checked={isAccepted}
                      onChange={(value) => handleToggle(consent.key, value)}
                      size="md"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legal Status Summary */}
        <div className={`mt-4 p-4 rounded-lg border ${
          isLegalConsentComplete
            ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
            : 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'
        }`}>
          <div className="flex items-center gap-2">
            {isLegalConsentComplete ? (
              <>
                <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-200 font-medium">
                  All required agreements accepted
                </span>
              </>
            ) : (
              <>
                <AlertTriangle size={18} className="text-yellow-600 dark:text-yellow-400" />
                <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                  Please accept all required agreements to continue
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
