// src/pages/legal/LegalIndex.tsx
import React, { useState, useEffect } from "react";
import { useTheme } from "@/src/utils/ThemeContext";
import { ConsentManager as ConsentUtil } from "../../utils/consentManager";
import {
  Shield,
  FileText,
  Cookie,
  Database,
  AlertTriangle,
  Scale,
  Globe,
  Users,
  Eye,
  Settings,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  Download,
  Mail,
  ExternalLink,
  ChevronRight,
  Star,
  Lock,
  Plane,
  RefreshCw,
} from "lucide-react";

export const LegalIndex: React.FC = () => {
  const { theme } = useTheme();
  interface ConsentStatus {
    [key: string]: boolean;
    hasValidConsent: boolean;
  }

  const [consentStatus, setConsentStatus] = useState<ConsentStatus | null>(
    null
  );
  const [complianceScore, setComplianceScore] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const updateStatus = () => {
      const status = ConsentUtil.getConsentSummary();
      const hasValid = ConsentUtil.hasValidConsent();
      setConsentStatus({ ...status, hasValidConsent: hasValid });

      // Calculate compliance score
      const totalCategories = Object.keys(status).length;
      const acceptedCategories = Object.values(status).filter(Boolean).length;
      setComplianceScore(
        Math.round((acceptedCategories / totalCategories) * 100)
      );
    };

    updateStatus();
    setLastUpdated(new Date().toLocaleDateString());

    // Listen for consent updates
    const handleConsentUpdate = () => updateStatus();
    window.addEventListener("consentUpdated", handleConsentUpdate);
    window.addEventListener("consentCleared", handleConsentUpdate);

    return () => {
      window.removeEventListener("consentUpdated", handleConsentUpdate);
      window.removeEventListener("consentCleared", handleConsentUpdate);
    };
  }, []);

  const legalDocuments = [
    {
      id: "privacy",
      title: "Privacy Policy",
      description: "How we collect, use, and protect your personal information",
      icon: Shield,
      color: "blue",
      importance: "high",
      lastUpdated: "January 19, 2024",
      sections: ["Data Collection", "Usage", "Sharing", "Rights", "Security"],
      compliance: ["GDPR", "CCPA", "PIPEDA"],
      readTime: "8 min",
    },
    {
      id: "terms",
      title: "Terms of Service",
      description: "Legal agreement and conditions for using SkyMapper",
      icon: FileText,
      color: "green",
      importance: "critical",
      lastUpdated: "January 19, 2024",
      sections: [
        "Service Description",
        "User Responsibilities",
        "Liability Limits",
        "Aviation Disclaimers",
      ],
      compliance: ["Legal Requirements", "Aviation Safety"],
      readTime: "12 min",
    },
    {
      id: "cookies",
      title: "Cookie Policy",
      description: "Information about cookies and tracking technologies we use",
      icon: Cookie,
      color: "orange",
      importance: "medium",
      lastUpdated: "January 19, 2024",
      sections: [
        "Cookie Types",
        "Management",
        "Third-party Cookies",
        "Browser Controls",
      ],
      compliance: ["ePrivacy Directive", "GDPR"],
      readTime: "6 min",
    },
    {
      id: "data-protection",
      title: "Data Protection Policy",
      description: "GDPR compliance and your data protection rights",
      icon: Database,
      color: "purple",
      importance: "high",
      lastUpdated: "January 19, 2024",
      sections: ["GDPR Rights", "Data Processing", "Legal Basis", "Transfers"],
      compliance: ["GDPR", "Data Protection Act"],
      readTime: "10 min",
    },
    {
      id: "disclaimer",
      title: "Aviation Disclaimer",
      description:
        "Critical safety warnings and limitations for flight planning",
      icon: AlertTriangle,
      color: "red",
      importance: "critical",
      lastUpdated: "January 19, 2024",
      sections: [
        "Safety Warnings",
        "Data Limitations",
        "Liability",
        "Emergency Procedures",
      ],
      compliance: ["Aviation Safety", "Risk Management"],
      readTime: "15 min",
    },
  ];

  const complianceFeatures = [
    {
      title: "GDPR Compliance",
      description: "Full General Data Protection Regulation compliance",
      icon: Shield,
      status: "active",
      features: [
        "Data Subject Rights",
        "Lawful Processing",
        "Privacy by Design",
        "Data Transfers",
      ],
    },
    {
      title: "Cookie Management",
      description: "Granular cookie consent and management system",
      icon: Cookie,
      status: "active",
      features: [
        "Consent Manager",
        "Cookie Categories",
        "Opt-out Controls",
        "Real-time Updates",
      ],
    },
    {
      title: "Aviation Safety",
      description: "Comprehensive disclaimers and safety warnings",
      icon: Plane,
      status: "active",
      features: [
        "Liability Limitations",
        "Usage Warnings",
        "Official Sources",
        "Emergency Procedures",
      ],
    },
    {
      title: "Data Security",
      description: "Enterprise-grade data protection and security",
      icon: Lock,
      status: "active",
      features: [
        "Encryption",
        "Access Controls",
        "Audit Logging",
        "Breach Response",
      ],
    },
  ];

  const quickActions = [
    {
      title: "Manage Privacy Settings",
      description: "Update your consent preferences",
      icon: Settings,
      action: "consent-manager",
      color: "blue",
    },
    {
      title: "Download Your Data",
      description: "Export your personal information",
      icon: Download,
      action: "export-data",
      color: "green",
    },
    {
      title: "Contact Privacy Officer",
      description: "Get help with privacy questions",
      icon: Mail,
      action: "contact-privacy",
      color: "purple",
    },
    {
      title: "Report Data Concern",
      description: "File a data protection complaint",
      icon: AlertTriangle,
      action: "report-concern",
      color: "red",
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<
      string,
      { border: string; bg: string; text: string; button: string }
    > = {
      blue: {
        border: "border-blue-300 dark:border-blue-700",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        text: "text-blue-800 dark:text-blue-200",
        button: "bg-blue-600 hover:bg-blue-700",
      },
      green: {
        border: "border-green-300 dark:border-green-700",
        bg: "bg-green-50 dark:bg-green-900/20",
        text: "text-green-800 dark:text-green-200",
        button: "bg-green-600 hover:bg-green-700",
      },
      orange: {
        border: "border-orange-300 dark:border-orange-700",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        text: "text-orange-800 dark:text-orange-200",
        button: "bg-orange-600 hover:bg-orange-700",
      },
      purple: {
        border: "border-purple-300 dark:border-purple-700",
        bg: "bg-purple-50 dark:bg-purple-900/20",
        text: "text-purple-800 dark:text-purple-200",
        button: "bg-purple-600 hover:bg-purple-700",
      },
      red: {
        border: "border-red-300 dark:border-red-700",
        bg: "bg-red-50 dark:bg-red-900/20",
        text: "text-red-800 dark:text-red-200",
        button: "bg-red-600 hover:bg-red-700",
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "consent-manager":
        // Open consent manager modal
        break;
      case "export-data":
        const data = ConsentUtil.exportConsents();
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `skymapper-data-export-${
          new Date().toISOString().split("T")[0]
        }.json`;
        a.click();
        URL.revokeObjectURL(url);
        break;
      case "contact-privacy":
        window.location.href =
          "mailto:privacy@skymapper.com?subject=Privacy Inquiry";
        break;
      case "report-concern":
        window.location.href =
          "mailto:dpo@skymapper.com?subject=Data Protection Concern";
        break;
    }
  };

  return (
    <div className={`min-h-screen ${`gradient-${theme}`} py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <Scale size={48} className="text-[var(--button-text)]" />
            <div>
              <h1 className="text-4xl font-bold text-[var(--sidebar-text)]">
                Legal & Privacy Center
              </h1>
              <p className="text-[var(--sidebar-text)] opacity-75 mt-2 text-lg">
                Your comprehensive guide to SkyMappers legal policies and
                privacy practices
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-[var(--sidebar-text)] opacity-75">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              Last updated: {lastUpdated}
            </span>
            <span className="flex items-center gap-1">
              <Globe size={14} />
              Global compliance standards
            </span>
            <span className="flex items-center gap-1">
              <Shield size={14} />
              Privacy by design
            </span>
            <span className="flex items-center gap-1">
              <Plane size={14} />
              Aviation safety focused
            </span>
          </div>
        </div>

        {/* Critical Aviation Warning */}
        <div className="mb-12 p-8 rounded-xl border-4 border-red-600 bg-red-50 dark:bg-red-900/30 shadow-xl">
          <div className="flex items-start gap-4">
            <AlertTriangle
              size={36}
              className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1"
            />
            <div>
              <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">
                ⚠️ CRITICAL AVIATION SAFETY NOTICE ⚠️
              </h2>
              <div className="text-red-700 dark:text-red-300 space-y-3">
                <p className="text-lg font-semibold">
                  SkyMapper is for PLANNING PURPOSES ONLY and is NOT approved
                  for actual flight navigation.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium mb-2">
                      ✓ ALWAYS verify information with:
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>• Official aviation authorities (FAA, EASA, etc.)</li>
                      <li>• Current NOTAMs and weather reports</li>
                      <li>• Certified navigation equipment</li>
                      <li>• Official aeronautical charts</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-2">
                      ⚠️ NEVER use as your sole source for:
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>• Primary flight navigation</li>
                      <li>• Weather decision making</li>
                      <li>• Airspace compliance</li>
                      <li>• Emergency procedures</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Dashboard */}
        <div className="mb-12 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users size={28} className="text-[var(--button-text)]" />
              <div>
                <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">
                  Your Privacy Dashboard
                </h2>
                <p className="text-[var(--sidebar-text)] opacity-75">
                  Current status of your privacy settings and data protection
                </p>
              </div>
            </div>

            <div className="text-right">
              <div
                className={`text-3xl font-bold ${
                  complianceScore >= 80
                    ? "text-green-600 dark:text-green-400"
                    : complianceScore >= 60
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {complianceScore}%
              </div>
              <div className="text-sm text-[var(--sidebar-text)] opacity-60">
                Compliance Score
              </div>
            </div>
          </div>

          {consentStatus && (
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {Object.entries(consentStatus)
                .filter(([key]) => key !== "hasValidConsent")
                .map(([key, value]) => (
                  <div
                    key={key}
                    className={`p-4 rounded-lg border ${
                      value
                        ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {value ? (
                        <CheckCircle
                          size={16}
                          className="text-green-600 dark:text-green-400"
                        />
                      ) : (
                        <XCircle
                          size={16}
                          className="text-gray-500 dark:text-gray-400"
                        />
                      )}
                      <span className="text-sm font-medium text-[var(--sidebar-text)] capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </div>
                    <span
                      className={`text-xs ${
                        value
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {value ? "Active" : "Disabled"}
                    </span>
                  </div>
                ))}
            </div>
          )}

          <div className="grid md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const colors = getColorClasses(action.color);

              return (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className={`p-4 rounded-lg border ${colors.border} ${colors.bg} hover:shadow-md transition-all duration-200 text-left group`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon size={20} className={colors.text} />
                    <span className={`font-medium ${colors.text} text-sm`}>
                      {action.title}
                    </span>
                  </div>
                  <p className={`text-xs ${colors.text} opacity-75`}>
                    {action.description}
                  </p>
                  <ChevronRight
                    size={16}
                    className={`${colors.text} opacity-50 group-hover:opacity-100 transition-opacity mt-2`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Legal Documents */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <FileText size={28} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">
              Legal Documents & Policies
            </h2>
          </div>

          <div className="grid gap-6">
            {legalDocuments.map((doc) => {
              const Icon = doc.icon;
              const colors = getColorClasses(doc.color);

              return (
                <div
                  key={doc.id}
                  className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden hover:shadow-lg transition-all duration-200`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <Icon size={32} className={colors.text} />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-xl font-bold ${colors.text}`}>
                              {doc.title}
                            </h3>
                            {doc.importance === "critical" && (
                              <Star
                                size={16}
                                className="text-yellow-500 fill-current"
                              />
                            )}
                            {doc.importance === "high" && (
                              <Info size={16} className="text-blue-500" />
                            )}
                          </div>
                          <p className={`${colors.text} opacity-80 mb-3`}>
                            {doc.description}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm mb-4">
                            <span className={`${colors.text} opacity-60`}>
                              <Clock size={12} className="inline mr-1" />
                              {doc.readTime} read
                            </span>
                            <span className={`${colors.text} opacity-60`}>
                              <RefreshCw size={12} className="inline mr-1" />
                              Updated {doc.lastUpdated}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        className={`px-4 py-2 ${colors.button} text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2`}
                      >
                        <Eye size={16} />
                        View Policy
                        <ExternalLink size={14} />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h4 className={`font-semibold ${colors.text} mb-2`}>
                          Key Sections:
                        </h4>
                        <ul
                          className={`${colors.text} opacity-70 text-sm space-y-1`}
                        >
                          {doc.sections.map((section, idx) => (
                            <li key={idx}>• {section}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className={`font-semibold ${colors.text} mb-2`}>
                          Compliance:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {doc.compliance.map((comp, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-1 ${colors.bg} ${colors.text} border ${colors.border} rounded`}
                            >
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className={`font-semibold ${colors.text} mb-2`}>
                          Importance:
                        </h4>
                        <div className={`capitalize ${colors.text} opacity-75`}>
                          {doc.importance === "critical" &&
                            "🚨 Critical - Must Read"}
                          {doc.importance === "high" && "⚠️ High Priority"}
                          {doc.importance === "medium" && "ℹ️ Important"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compliance Features */}
        <div className="mb-12 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-8">
            <Shield size={28} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">
              Compliance & Security Features
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceFeatures.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon size={24} className="text-[var(--button-text)]" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--sidebar-text)]">
                        {feature.title}
                      </h3>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ● {feature.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--sidebar-text)] opacity-75 mb-4">
                    {feature.description}
                  </p>

                  <div className="space-y-1">
                    {feature.features.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-2">
                        <CheckCircle
                          size={12}
                          className="text-green-600 dark:text-green-400 flex-shrink-0"
                        />
                        <span className="text-xs text-[var(--sidebar-text)] opacity-70">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-12 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-8">
            <Mail size={28} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">
              Legal & Privacy Contacts
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                <Shield size={20} />
                Data Protection Officer
              </h3>
              <div className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  <span>dpo@skymapper.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>Response within 72 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={14} />
                  <span>GDPR & privacy matters</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
                <Scale size={20} />
                Legal Department
              </h3>
              <div className="space-y-2 text-green-700 dark:text-green-300 text-sm">
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  <span>legal@skymapper.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>5-10 business days</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={14} />
                  <span>Terms & legal matters</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} />
                Safety Compliance
              </h3>
              <div className="space-y-2 text-purple-700 dark:text-purple-300 text-sm">
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  <span>safety@skymapper.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>Immediate for critical issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <Plane size={14} />
                  <span>Aviation safety concerns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="text-center p-8 rounded-xl border border-[var(--sidebar-border)] bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <h2 className="text-2xl font-bold text-[var(--sidebar-text)] mb-4">
            Commitment to Privacy & Safety
          </h2>
          <p className="text-[var(--sidebar-text)] opacity-75 max-w-3xl mx-auto leading-relaxed">
            SkyMapper is built with privacy by design and safety as our top
            priority. We comply with international data protection standards
            while maintaining complete transparency about our aviation planning
            tools limitations. Your trust is essential to us, and we are
            committed to protecting both your data and your safety.
          </p>

          <div className="flex justify-center items-center gap-6 mt-6 text-sm text-[var(--sidebar-text)] opacity-60">
            <span className="flex items-center gap-1">
              <Shield size={14} />
              Privacy Protected
            </span>
            <span className="flex items-center gap-1">
              <Lock size={14} />
              Data Secured
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle size={14} />
              Safety First
            </span>
            <span className="flex items-center gap-1">
              <Scale size={14} />
              Fully Compliant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LegalIndex;
