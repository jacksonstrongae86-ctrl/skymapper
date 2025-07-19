// src/components/legal/PolicyModal.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/src/utils/ThemeContext";
import {
  X,
  FileText,
  Shield,
  Cookie,
  Database,
  AlertTriangle,
//   Download,
//   Printer,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
interface PolicyModalProps {
  policyType: string;
  onClose: () => void;
  isOpen?: boolean;
}

interface PolicySection {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  policyType,
  onClose,
  isOpen = true,
}) => {
  const { theme } = useTheme();
  const [currentSection, setCurrentSection] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [, setSearchResults] = useState<number[]>([]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const getPolicyConfig = (type: string) => {
    switch (type) {
      case "privacy":
        return {
          title: "Privacy Policy",
          icon: Shield,
          lastUpdated: "January 2024",
          sections: getPrivacySections(),
        };
      case "terms":
        return {
          title: "Terms of Service",
          icon: FileText,
          lastUpdated: "January 2024",
          sections: getTermsSections(),
        };
      case "cookie":
        return {
          title: "Cookie Policy",
          icon: Cookie,
          lastUpdated: "January 2024",
          sections: getCookieSections(),
        };
      case "data-protection":
        return {
          title: "Data Protection Policy",
          icon: Database,
          lastUpdated: "January 2024",
          sections: getDataProtectionSections(),
        };
      default:
        return {
          title: "Legal Document",
          icon: FileText,
          lastUpdated: "January 2024",
          sections: [],
        };
    }
  };

  const getPrivacySections = (): PolicySection[] => [
    {
      id: "introduction",
      title: "Introduction",
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p className="text-[var(--sidebar-text)]">
            SkyMapper (we, our, or us) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you use our flight planning
            application.
          </p>
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-2">
              <AlertTriangle
                size={20}
                className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
                  IMPORTANT AVIATION DISCLAIMER
                </p>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  SkyMapper is a flight planning tool only. We do not take
                  responsibility for flight safety, weather accuracy, navigation
                  precision, or any aviation-related decisions. Always verify
                  all information with official aviation authorities and current
                  NOTAMs.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: Database,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-[var(--sidebar-text)] mb-3">
              Personal Information
            </h4>
            <ul className="list-disc pl-6 text-[var(--sidebar-text)] space-y-2">
              <li>Email address (if you create an account)</li>
              <li>
                Flight planning data you input (routes, waypoints, preferences)
              </li>
              <li>Usage preferences and application settings</li>
              <li>Device information and browser type</li>
              <li>Location data (for weather and navigation services)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--sidebar-text)] mb-3">
              Automatically Collected Information
            </h4>
            <ul className="list-disc pl-6 text-[var(--sidebar-text)] space-y-2">
              <li>IP address and general location data</li>
              <li>Usage analytics and performance metrics</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Error logs and diagnostic information</li>
              <li>Session data and interaction patterns</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "data-usage",
      title: "How We Use Your Information",
      content: (
        <div className="space-y-4">
          <p className="text-[var(--sidebar-text)] mb-4">
            We use your information for the following purposes:
          </p>
          <ul className="list-disc pl-6 text-[var(--sidebar-text)] space-y-2">
            <li>
              <strong>Service Provision:</strong> Provide and maintain SkyMapper
              services
            </li>
            <li>
              <strong>Flight Planning:</strong> Process route calculations,
              weather data, and navigation
            </li>
            <li>
              <strong>Improvement:</strong> Analyze usage to enhance our
              application and user experience
            </li>
            <li>
              <strong>Communication:</strong> Send important updates,
              notifications, and support messages
            </li>
            <li>
              <strong>Security:</strong> Ensure platform security and prevent
              fraud or misuse
            </li>
            <li>
              <strong>Compliance:</strong> Meet legal obligations and regulatory
              requirements
            </li>
          </ul>
        </div>
      ),
    },
  ];

  const getTermsSections = (): PolicySection[] => [
    {
      id: "aviation-disclaimer",
      title: "Aviation Safety Disclaimer",
      icon: AlertTriangle,
      content: (
        <div className="p-6 rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-900/20">
          <div className="space-y-4 text-red-800 dark:text-red-200">
            <h4 className="font-bold text-lg flex items-center gap-2">
              <AlertTriangle size={20} />
              CRITICAL AVIATION SAFETY NOTICE
            </h4>
            <p className="font-bold">
              SkyMapper is NOT approved for actual flight operations and should
              NOT be used as a primary navigation tool.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                This is a PLANNING TOOL ONLY - not certified aviation software
              </li>
              <li>Weather data may be delayed, inaccurate, or incomplete</li>
              <li>
                Navigation calculations are estimates and may contain errors
              </li>
              <li>
                Always verify ALL information with official aviation authorities
              </li>
              <li>
                Check current NOTAMs, weather reports, and airspace restrictions
              </li>
              <li>
                Use certified navigation equipment and official charts for
                flight
              </li>
            </ul>
            <p className="font-bold">
              BY USING SKYMAPPER, YOU ACKNOWLEDGE FULL RESPONSIBILITY FOR ALL
              FLIGHT-RELATED DECISIONS.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "service-description",
      title: "Description of Service",
      content: (
        <div className="space-y-4">
          <p className="text-[var(--sidebar-text)] mb-4">
            SkyMapper is a flight planning application that provides:
          </p>
          <ul className="list-disc pl-6 text-[var(--sidebar-text)] space-y-2">
            <li>Route planning and navigation calculations</li>
            <li>Weather data integration (third-party sources)</li>
            <li>Fuel consumption estimates and flight time calculations</li>
            <li>Mapping and visualization tools</li>
            <li>Flight log and planning history</li>
            <li>Educational resources and tutorials</li>
          </ul>
        </div>
      ),
    },
    {
      id: "liability-limitation",
      title: "Limitation of Liability",
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              IMPORTANT LEGAL NOTICE
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              The following limitations apply to your use of SkyMapper. Please
              read carefully.
            </p>
          </div>
          <div className="text-[var(--sidebar-text)]">
            <p className="font-semibold mb-3">
              IN NO EVENT SHALL SKYMAPPER, ITS OFFICERS, DIRECTORS, EMPLOYEES,
              OR AGENTS BE LIABLE FOR:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Any direct, indirect, incidental, special, consequential, or
                punitive damages
              </li>
              <li>Loss of profits, revenue, data, or use</li>
              <li>Aircraft accidents, incidents, or safety-related issues</li>
              <li>Navigation errors or weather-related incidents</li>
              <li>Fuel miscalculations or planning errors</li>
              <li>Violations of aviation regulations</li>
              <li>
                Any damages arising from use or inability to use the service
              </li>
            </ul>
            <p className="font-semibold mt-4">
              YOUR USE OF SKYMAPPER IS AT YOUR SOLE RISK AND RESPONSIBILITY.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const getCookieSections = (): PolicySection[] => [
    {
      id: "cookie-overview",
      title: "What Are Cookies",
      icon: Cookie,
      content: (
        <div className="space-y-4">
          <p className="text-[var(--sidebar-text)]">
            Cookies are small text files stored on your device when you visit
            SkyMapper. They help us provide you with a better experience by
            remembering your preferences and analyzing how you use our service.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
              <h4 className="font-semibold text-[var(--sidebar-text)] mb-2">
                First-Party Cookies
              </h4>
              <p className="text-sm text-[var(--sidebar-text)] opacity-75">
                Set directly by SkyMapper to provide core functionality and
                remember your preferences.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
              <h4 className="font-semibold text-[var(--sidebar-text)] mb-2">
                Third-Party Cookies
              </h4>
              <p className="text-sm text-[var(--sidebar-text)] opacity-75">
                Set by our partners for analytics, weather data, and mapping
                services.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const getDataProtectionSections = (): PolicySection[] => [
    {
      id: "gdpr-compliance",
      title: "GDPR Compliance",
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p className="text-[var(--sidebar-text)]">
            SkyMapper is committed to complying with the General Data Protection
            Regulation (GDPR) and protecting the rights of EU residents.
          </p>
          <div className="space-y-3">
            <h4 className="font-semibold text-[var(--sidebar-text)]">
              Your Rights Under GDPR:
            </h4>
            <ul className="list-disc pl-6 text-[var(--sidebar-text)] space-y-1">
              <li>
                <strong>Right to Access:</strong> Request information about your
                personal data
              </li>
              <li>
                <strong>Right to Rectification:</strong> Correct inaccurate data
              </li>
              <li>
                <strong>Right to Erasure:</strong> Right to be forgotten
              </li>
              <li>
                <strong>Right to Restrict Processing:</strong> Limit how we use
                your data
              </li>
              <li>
                <strong>Right to Data Portability:</strong> Receive your data in
                a portable format
              </li>
              <li>
                <strong>Right to Object:</strong> Object to certain types of
                processing
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const config = getPolicyConfig(policyType);
  const PolicyIcon = config.icon;

//   const handlePrint = () => {
//     // Create a new window with printable content
//     const printWindow = window.open("", "_blank");
//     if (!printWindow) {
//       alert("Pop-up blocked. Please allow pop-ups to print.");
//       return;
//     }

//     const printContent = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <title>${config.title} - SkyMapper</title>
//       <style>
//         body {
//           font-family: Arial, sans-serif;
//           line-height: 1.6;
//           margin: 20px;
//           color: #333;
//         }
//         h1, h2, h3 {
//           color: #2c3e50;
//           margin-top: 20px;
//         }
//         .header {
//           border-bottom: 2px solid #3498db;
//           padding-bottom: 10px;
//           margin-bottom: 20px;
//         }
//         .section {
//           margin-bottom: 30px;
//           page-break-inside: avoid;
//         }
//         .warning {
//           background-color: #fff3cd;
//           border: 1px solid #ffeaa7;
//           border-radius: 4px;
//           padding: 15px;
//           margin: 15px 0;
//         }
//         @media print {
//           body { margin: 0; }
//           .no-print { display: none; }
//         }
//       </style>
//     </head>
//     <body>
//       <div class="header">
//         <h1>${config.title}</h1>
//         <p>Last updated: ${config.lastUpdated}</p>
//         <p>Generated: ${new Date().toLocaleDateString()}</p>
//       </div>

//       ${config.sections
//         .map(
//           (section) => `
//         <div class="section">
//           <h2>${section.title}</h2>
//           <div>${
//             typeof section.content === "string"
//               ? section.content
//               : "Content not available for print"
//           }</div>
//         </div>
//       `
//         )
//         .join("")}

//       <div style="margin-top: 40px; font-size: 12px; color: #666;">
//         <p>This document was generated from SkyMapper Legal Policies</p>
//         <p>For the most current version, please visit our website</p>
//       </div>
//     </body>
//     </html>
//   `;

//     printWindow.document.write(printContent);
//     printWindow.document.close();

//     // Wait for content to load, then print
//     setTimeout(() => {
//       printWindow.print();
//       printWindow.close();
//     }, 250);
//   };

//   const handleDownload = () => {
//     const content = config.sections
//       .map(
//         (section) =>
//           `${section.title}\n${"=".repeat(section.title.length)}\n\n${
//             section.content
//           }\n\n`
//       )
//       .join("");

//     const blob = new Blob([content], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `skymapper-${policyType}-policy.txt`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };
  //   const [isSearching, setIsSearching] = useState(false);
  const getSearchableContent = useCallback(
    (content: React.ReactNode): string => {
      if (typeof content === "string") return content;
      if (typeof content === "number") return content.toString();
      if (Array.isArray(content)) {
        return content.map(getSearchableContent).join(" ");
      }
      if (React.isValidElement(content)) {
        const props = content.props as { children?: React.ReactNode };
        return getSearchableContent(props.children);
      }
      return "";
    },
    []
  );

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const results: number[] = [];
    config.sections.forEach((section, index) => {
      const searchableText = `${section.title} ${getSearchableContent(
        section.content
      )}`.toLowerCase();
      if (searchableText.includes(searchTerm.toLowerCase())) {
        results.push(index);
      }
    });

    setSearchResults(results);
  }, [searchTerm, config.sections, getSearchableContent]);

  // Helper function to extract searchable text from React content

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 dark:bg-black/20 backdrop-blur-md">
      <div
        className={`
    w-full max-w-6xl mx-2 sm:mx-4 rounded-xl shadow-2xl border border-[var(--sidebar-border)]
    ${`gradient-${theme}`} max-h-[95vh] sm:max-h-[90vh] flex flex-col
  `}
      >
        {/* Header - Mobile optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-[var(--sidebar-border)]">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <PolicyIcon size={24} className="text-[var(--button-text)]" />
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--sidebar-text)]">
                {config.title}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--sidebar-text)] opacity-60">
                Last updated: {config.lastUpdated}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search - Hide on small screens */}
            {/* <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-2 rounded-lg border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] text-sm w-32 lg:w-48"
              />
              <Search
                size={16}
                className="absolute left-2.5 top-2.5 text-[var(--sidebar-text)] opacity-50"
              />
            </div> */}

            {/* Actions - Stack on mobile */}
            <div className="flex gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              <X size={18} className="text-[var(--sidebar-text)]" />
            </button>
            </div>
            {/* <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                title="Print"
              >
                <Printer size={16} className="text-[var(--sidebar-text)]" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                title="Download"
              >
                <Download size={16} className="text-[var(--sidebar-text)]" />
              </button>

            </div> */}
          </div>
        </div>

        {/* Mobile search bar - show on small screens */}
        <div className="md:hidden border-b border-[var(--sidebar-border)] p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-4 py-2 rounded-lg border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] text-sm"
            />
            <Search
              size={16}
              className="absolute left-2.5 top-2.5 text-[var(--sidebar-text)] opacity-50"
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation - Hide on mobile, show as horizontal tabs */}
          <div className="hidden lg:block w-64 xl:w-80 border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] bg-opacity-30 overflow-y-auto custom_scrollbar">
            <div className="p-4">
              <h3 className="font-semibold text-[var(--sidebar-text)] mb-3">
                Sections
              </h3>
              <nav className="space-y-1">
                {config.sections.map((section, index) => {
                  const SectionIcon = section.icon || FileText;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setCurrentSection(index)}
                      className={`
                    w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3
                    ${
                      currentSection === index
                        ? `${`button-gradient-${theme}`} text-[var(--button-text)] shadow-md`
                        : "hover:bg-white hover:bg-opacity-5 text-[var(--sidebar-text)]"
                    }
                  `}
                    >
                      <SectionIcon size={16} />
                      <span className="font-medium text-sm">
                        {section.title}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Mobile navigation tabs */}
          <div className="lg:hidden w-full border-b border-[var(--sidebar-border)] p-2 bg-[var(--sidebar-bg)] bg-opacity-30">
            <div className="flex overflow-x-auto gap-2 custom_scrollbar">
              {config.sections.map((section, index) => {
                const SectionIcon = section.icon || FileText;
                return (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSection(index)}
                    className={`
                  whitespace-nowrap px-3 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-2 transition-all duration-200
                  ${
                    currentSection === index
                      ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                      : "text-[var(--sidebar-text)] hover:bg-white hover:bg-opacity-5"
                  }
                `}
                  >
                    <SectionIcon size={14} />
                    {section.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom_scrollbar">
            <div className="p-4 sm:p-6 lg:p-8">
              {config.sections[currentSection] && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    {config.sections[currentSection].icon &&
                      React.createElement(
                        config.sections[currentSection]
                          .icon as React.ComponentType<{
                          size?: number;
                          className?: string;
                        }>,
                        {
                          size: 20,
                          className: "text-[var(--button-text)]",
                        }
                      )}
                    <h3 className="text-xl sm:text-2xl font-bold text-[var(--sidebar-text)]">
                      {config.sections[currentSection].title}
                    </h3>
                  </div>
                  <div className="prose prose-sm sm:prose max-w-none text-[var(--sidebar-text)]">
                    {config.sections[currentSection].content}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Footer Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-t border-[var(--sidebar-border)] gap-4">
          <button
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
            className={`
      flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 w-full sm:w-auto justify-center
      ${
        currentSection === 0
          ? "opacity-50 cursor-not-allowed"
          : `hover:${`button-gradient-${theme}`} hover:text-[var(--button-text)]`
      }
    `}
          >
            <ChevronLeft size={16} />
            <span className="text-sm">Previous</span>
          </button>

          <div className="text-sm text-[var(--sidebar-text)] opacity-60 text-center">
            {currentSection + 1} of {config.sections.length}
          </div>

          <button
            onClick={() =>
              setCurrentSection(
                Math.min(config.sections.length - 1, currentSection + 1)
              )
            }
            disabled={currentSection === config.sections.length - 1}
            className={`
      flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 w-full sm:w-auto justify-center
      ${
        currentSection === config.sections.length - 1
          ? "opacity-50 cursor-not-allowed"
          : `hover:${`button-gradient-${theme}`} hover:text-[var(--button-text)]`
      }
    `}
          >
            <span className="text-sm">Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
