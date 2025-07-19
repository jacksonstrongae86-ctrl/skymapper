// src/components/legal/LegalFooter.tsx
import React, { useState, useEffect } from "react";
import { useTheme } from "@/src/utils/ThemeContext";
import { ConsentManager as ConsentUtil } from "../../utils/consentManager";
import {
  Shield,
  FileText,
  Cookie,
  Settings,
  ExternalLink,
  AlertTriangle,
//   Eye,
  Globe,
  Mail,
  MapPin,
  Phone,
  Clock,
  ChevronUp,
  ChevronDown
} from "lucide-react";

interface LegalFooterProps {
  onOpenPolicy?: (policyType: string) => void;
  onOpenConsentManager?: () => void;
  showCompanyInfo?: boolean;
  showSocialLinks?: boolean;
  compact?: boolean;
}

export const LegalFooter: React.FC<LegalFooterProps> = ({
  onOpenPolicy,
  onOpenConsentManager,
  showCompanyInfo = true,
//   showSocialLinks = false,
  compact = false,
}) => {
  const { theme } = useTheme();
  interface ConsentStatus {
    [key: string]: boolean;
    hasValidConsent: boolean;
  }
  const [consentStatus, setConsentStatus] = useState<ConsentStatus | null>(null);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    const updateConsentStatus = () => {
      const status = ConsentUtil.getConsentSummary();
      const hasValid = ConsentUtil.hasValidConsent();
      setConsentStatus({ ...status, hasValidConsent: hasValid });
    };

    // Initial load
    updateConsentStatus();

    // Listen for consent updates
    const handleConsentUpdate = () => updateConsentStatus();
    window.addEventListener('consentUpdated', handleConsentUpdate);
    window.addEventListener('consentCleared', handleConsentUpdate);

    return () => {
      window.removeEventListener('consentUpdated', handleConsentUpdate);
      window.removeEventListener('consentCleared', handleConsentUpdate);
    };
  }, []);

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  const legalLinks = [
    {
      key: "privacy",
      title: "Privacy Policy",
      icon: Shield,
      description: "How we collect and protect your data",
    },
    {
      key: "terms",
      title: "Terms of Service",
      icon: FileText,
      description: "Your rights and responsibilities",
    },
    {
      key: "cookie",
      title: "Cookie Policy",
      icon: Cookie,
      description: "How we use cookies and tracking",
    },
    {
      key: "data-protection",
      title: "Data Protection",
      icon: Shield,
      description: "GDPR compliance and your rights",
    },
    {
      key: "disclaimer",
      title: "Aviation Disclaimer",
      icon: AlertTriangle,
      description: "Important safety limitations",
    },
  ];

  const quickActions = [
    {
      title: "Manage Consent",
      description: "Update your privacy preferences",
      icon: Settings,
      action: () => onOpenConsentManager?.(),
    },
    {
      title: "Download Data",
      description: "Export your personal information",
      icon: FileText,
      action: () => {
        const data = ConsentUtil.exportConsents();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'skymapper-data.json';
        a.click();
        URL.revokeObjectURL(url);
      },
    },
    {
      title: "Clear All Data",
      description: "Reset all preferences and cookies",
      icon: AlertTriangle,
      action: () => {
        if (confirm("Are you sure you want to clear all data and preferences?")) {
          ConsentUtil.clearAllData();
          alert("All data has been cleared.");
        }
      },
    },
  ];

  if (compact && !isExpanded) {
    return (
      <footer className={`border-t border-[var(--sidebar-border)] ${`gradient-${theme}`}`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-[var(--sidebar-text)] opacity-75">
              <span>© 2024 SkyMapper</span>
              <button
                onClick={() => onOpenPolicy?.('privacy')}
                className="hover:opacity-100 transition-opacity"
              >
                Privacy
              </button>
              <button
                onClick={() => onOpenPolicy?.('terms')}
                className="hover:opacity-100 transition-opacity"
              >
                Terms
              </button>
              {consentStatus && (
                <button
                  onClick={onOpenConsentManager}
                  className={`
                    flex items-center gap-1 px-2 py-1 rounded text-xs
                    ${consentStatus.hasValidConsent
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    }
                  `}
                >
                  <Cookie size={12} />
                  Consent
                </button>
              )}
            </div>

            <button
              onClick={() => setIsExpanded(true)}
              className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors text-[var(--sidebar-text)]"
            >
              <ChevronUp size={16} />
            </button>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`border-t border-[var(--sidebar-border)] ${`gradient-${theme}`} mt-auto`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Aviation Safety Warning */}
        <div className="mb-8 p-4 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                Aviation Safety Notice
              </h4>
              <p className="text-red-700 dark:text-red-300 text-sm">
                SkyMapper is for flight planning purposes only. Not approved for actual navigation.
                Always verify with official aviation sources and use certified equipment for flight operations.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Legal Policies */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-[var(--sidebar-text)] mb-4 flex items-center gap-2">
              <FileText size={20} />
              Legal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {legalLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.key}
                    onClick={() => onOpenPolicy?.(link.key)}
                    className="
                      p-4 rounded-lg border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]
                      hover:bg-opacity-80 transition-all duration-200 text-left group
                      hover:shadow-md hover:border-[var(--button-bg)] hover:border-opacity-30
                    "
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        size={16}
                        className="text-[var(--sidebar-text)] opacity-60 group-hover:text-[var(--button-bg)] transition-colors flex-shrink-0 mt-1"
                      />
                      <div>
                        <h4 className="font-medium text-[var(--sidebar-text)] group-hover:text-[var(--button-bg)] transition-colors text-sm">
                          {link.title}
                        </h4>
                        <p className="text-xs text-[var(--sidebar-text)] opacity-60 mt-1">
                          {link.description}
                        </p>
                      </div>
                      <ExternalLink size={12} className="text-[var(--sidebar-text)] opacity-40 group-hover:opacity-70 transition-opacity" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy Controls */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--sidebar-text)] mb-4 flex items-center gap-2">
              <Settings size={20} />
              Privacy Controls
            </h3>

            {/* Consent Status */}
            {consentStatus && (
              <div className={`
                p-3 rounded-lg mb-4 border
                ${consentStatus.hasValidConsent
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'
                }
              `}>
                <div className="flex items-center gap-2 mb-2">
                  {consentStatus.hasValidConsent ? (
                    <>
                      <Shield size={16} className="text-green-600 dark:text-green-400" />
                      <span className="text-green-800 dark:text-green-200 font-medium text-sm">
                        Privacy Settings Active
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400" />
                      <span className="text-yellow-800 dark:text-yellow-200 font-medium text-sm">
                        Action Required
                      </span>
                    </>
                  )}
                </div>
                <div className="text-xs opacity-75">
                  Analytics: {consentStatus.analytics ? 'Enabled' : 'Disabled'} •
                  Marketing: {consentStatus.marketing ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="
                    w-full p-3 rounded-lg border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]
                    hover:bg-opacity-80 transition-all duration-200 text-left group
                    hover:border-[var(--button-bg)] hover:border-opacity-30
                  "
                >
                  <div className="flex items-center gap-3">
                    <action.icon
                      size={16}
                      className="text-[var(--sidebar-text)] opacity-60 group-hover:text-[var(--button-bg)] transition-colors flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-medium text-[var(--sidebar-text)] group-hover:text-[var(--button-bg)] transition-colors text-sm">
                        {action.title}
                      </h4>
                      <p className="text-xs text-[var(--sidebar-text)] opacity-60">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Company Information */}
          {showCompanyInfo && (
            <div>
              <h3 className="text-lg font-semibold text-[var(--sidebar-text)] mb-4 flex items-center gap-2">
                <Globe size={20} />
                Contact & Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-[var(--sidebar-text)] opacity-75">
                  <Mail size={14} />
                  <span>support@skymapper.com</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--sidebar-text)] opacity-75">
                  <MapPin size={14} />
                  <span>Privacy Officer</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--sidebar-text)] opacity-75">
                  <Phone size={14} />
                  <span>Data Protection Inquiries</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--sidebar-text)] opacity-75">
                  <Clock size={14} />
                  <span>Response within 30 days</span>
                </div>
              </div>

              {/* Certifications & Compliance */}
              <div className="mt-6 pt-4 border-t border-[var(--sidebar-border)] border-opacity-30">
                <h4 className="font-medium text-[var(--sidebar-text)] mb-2 text-sm">Compliance</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                    GDPR
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700">
                    CCPA
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700">
                    SOC 2
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-[var(--sidebar-border)] border-opacity-30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-[var(--sidebar-text)] opacity-60">
              © 2024 SkyMapper. All rights reserved. • Last updated: {lastUpdated}
            </div>

            <div className="flex items-center gap-4">
              {compact && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors text-[var(--sidebar-text)] opacity-60"
                >
                  <ChevronDown size={16} />
                </button>
              )}

              <div className="text-xs text-[var(--sidebar-text)] opacity-50">
                v1.0.0 • Built with privacy by design
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
