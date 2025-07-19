// src/pages/legal/DataProtectionPolicy.tsx
import React, { useState } from "react";
import { useTheme } from "@/src/utils/ThemeContext";
import {
  Shield,
  Database,
  Users,
  Lock,
  Eye,
  Download,
  Trash2,
  Settings,
  Globe,
  Clock,
  Mail,
  AlertTriangle,
  CheckCircle,
  Info,
  FileText,
  UserCheck,
  Scale,
  Flag,
  Phone,
  MapPin
} from "lucide-react";

export const DataProtectionPolicy: React.FC = () => {
  const { theme } = useTheme();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const dataProtectionRights = [
    {
      id: "access",
      title: "Right to Access",
      icon: Eye,
      description: "Request information about your personal data",
      details: [
        "What personal data we process",
        "Why we process your data",
        "Who we share your data with",
        "How long we keep your data",
        "Your rights regarding your data"
      ],
      timeframe: "1 month",
      complexity: "Simple",
    },
    {
      id: "rectification",
      title: "Right to Rectification",
      icon: Settings,
      description: "Correct inaccurate or incomplete data",
      details: [
        "Update incorrect personal information",
        "Complete incomplete data",
        "Correct outdated information",
        "Fix any data processing errors",
        "Update contact details and preferences"
      ],
      timeframe: "1 month",
      complexity: "Simple",
    },
    {
      id: "erasure",
      title: "Right to Erasure",
      icon: Trash2,
      description: "\"Right to be forgotten\" - delete your data",
      details: [
        "Delete personal data when no longer needed",
        "Remove data processed unlawfully",
        "Withdraw consent for data processing",
        "Object to data processing",
        "Comply with legal obligations"
      ],
      timeframe: "1 month",
      complexity: "Moderate",
    },
    {
      id: "restriction",
      title: "Right to Restrict Processing",
      icon: Lock,
      description: "Limit how we use your personal data",
      details: [
        "Temporarily halt data processing",
        "Maintain data without using it",
        "Restrict processing pending verification",
        "Limit processing during legal proceedings",
        "Object to processing while reviewing"
      ],
      timeframe: "1 month",
      complexity: "Moderate",
    },
    {
      id: "portability",
      title: "Right to Data Portability",
      icon: Download,
      description: "Receive your data in a portable format",
      details: [
        "Export data in machine-readable format",
        "Transfer data to another service",
        "Receive structured data files",
        "Get data in common formats (JSON, CSV)",
        "Include all personal data categories"
      ],
      timeframe: "1 month",
      complexity: "Moderate",
    },
    {
      id: "objection",
      title: "Right to Object",
      icon: AlertTriangle,
      description: "Object to certain types of data processing",
      details: [
        "Object to processing for legitimate interests",
        "Stop direct marketing communications",
        "Object to profiling and automated decisions",
        "Opt-out of research and analytics",
        "Stop processing for public interest tasks"
      ],
      timeframe: "1 month",
      complexity: "Simple",
    },
  ];

  const dataCategories = [
    {
      category: "Account Information",
      icon: Users,
      data: ["Email address", "Account preferences", "Login timestamps", "Security settings"],
      purpose: "Account management and authentication",
      retention: "Until account deletion + 30 days",
      legal_basis: "Contract performance",
    },
    {
      category: "Flight Planning Data",
      icon: Database,
      data: ["Flight routes", "Waypoints", "Aircraft details", "Fuel calculations"],
      purpose: "Provide flight planning services",
      retention: "2 years after last access",
      legal_basis: "Contract performance",
    },
    {
      category: "Usage Analytics",
      icon: FileText,
      data: ["Page views", "Feature usage", "Performance metrics", "Error logs"],
      purpose: "Service improvement and optimization",
      retention: "18 months (anonymized after 6)",
      legal_basis: "Legitimate interest",
    },
    {
      category: "Device Information",
      icon: Settings,
      data: ["IP address", "Browser type", "Device model", "Operating system"],
      purpose: "Security and technical support",
      retention: "12 months",
      legal_basis: "Legitimate interest",
    },
  ];

  const processingActivities = [
    {
      activity: "User Authentication",
      data_types: ["Email", "Password hash", "Session tokens"],
      purpose: "Secure access to SkyMapper services",
      legal_basis: "Contract performance",
      recipients: "None (internal only)",
      transfers: "No international transfers",
    },
    {
      activity: "Flight Planning Services",
      data_types: ["Flight routes", "Aircraft data", "Weather preferences"],
      purpose: "Provide core application functionality",
      legal_basis: "Contract performance",
      recipients: "Weather data providers (anonymized)",
      transfers: "EU/US (adequacy decision)",
    },
    {
      activity: "Customer Support",
      data_types: ["Contact information", "Support tickets", "Communication logs"],
      purpose: "Provide technical support and assistance",
      legal_basis: "Contract performance",
      recipients: "Support team members only",
      transfers: "No international transfers",
    },
    {
      activity: "Analytics and Improvement",
      data_types: ["Usage patterns", "Performance data", "Anonymous metrics"],
      purpose: "Improve service quality and user experience",
      legal_basis: "Legitimate interest",
      recipients: "Google Analytics (anonymized)",
      transfers: "EU/US (standard contractual clauses)",
    },
  ];

  return (
    <div className={`min-h-screen ${`gradient-${theme}`} py-8`}>
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <Shield size={40} className="text-[var(--button-text)]" />
            <div>
              <h1 className="text-4xl font-bold text-[var(--sidebar-text)]">
                Data Protection Policy
              </h1>
              <p className="text-[var(--sidebar-text)] opacity-75 mt-2">
                GDPR compliance and your data protection rights
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-[var(--sidebar-text)] opacity-75">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              Last updated: January 19, 2024
            </span>
            <span className="flex items-center gap-1">
              <Globe size={14} />
              GDPR Article 13 & 14 compliant
            </span>
            <span className="flex items-center gap-1">
              <Flag size={14} />
              EU residents protected
            </span>
          </div>
        </div>

        {/* Aviation Safety Notice */}
        <div className="mb-10 p-6 rounded-xl border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-800 dark:text-red-200 mb-2">
                Data Protection & Aviation Safety
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm">
                While we protect your personal data under GDPR, remember that SkyMapper is for planning only.
                Your data protection rights do not affect the fundamental limitation that this is not certified
                navigation software. Always use official sources for actual flight operations.
              </p>
            </div>
          </div>
        </div>

        {/* Data Controller Information */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <UserCheck size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Data Controller Information</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-[var(--sidebar-text)] mb-4">SkyMapper (Data Controller)</h3>
              <div className="space-y-3 text-[var(--sidebar-text)]">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="opacity-60" />
                  <span className="text-sm">
                    <strong>Address:</strong> [Your Company Address]<br />
                    [City, Country, Postal Code]
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="opacity-60" />
                  <span className="text-sm">
                    <strong>Email:</strong> privacy@skymapper.com
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="opacity-60" />
                  <span className="text-sm">
                    <strong>Phone:</strong> +[Your Phone Number]
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[var(--sidebar-text)] mb-4">Data Protection Officer (DPO)</h3>
              <div className="space-y-3 text-[var(--sidebar-text)]">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="opacity-60" />
                  <span className="text-sm">
                    <strong>Email:</strong> dpo@skymapper.com
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Info size={16} className="opacity-60" />
                  <span className="text-sm">
                    <strong>Role:</strong> Independent data protection oversight
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="opacity-60" />
                  <span className="text-sm">
                    <strong>Response:</strong> Within 72 hours for urgent matters
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Your Data Protection Rights */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-8">
            <Scale size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Your Data Protection Rights</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataProtectionRights.map((right) => {
              const Icon = right.icon;
              const isExpanded = expandedSection === right.id;

              return (
                <div key={right.id} className="rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] overflow-hidden hover:shadow-lg transition-all duration-200">
                  <button
                    onClick={() => toggleSection(right.id)}
                    className="w-full p-6 text-left"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Icon size={24} className="text-[var(--button-text)] flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-[var(--sidebar-text)] mb-1">
                          {right.title}
                        </h3>
                        <p className="text-sm text-[var(--sidebar-text)] opacity-75">
                          {right.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        right.complexity === 'Simple'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {right.complexity}
                      </span>
                      <span className="text-[var(--sidebar-text)] opacity-60">
                        {right.timeframe}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-[var(--sidebar-border)]">
                      <h4 className="font-medium text-[var(--sidebar-text)] mb-3 mt-4">What this includes:</h4>
                      <ul className="space-y-1">
                        {right.details.map((detail, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-[var(--sidebar-text)] opacity-80">
                            <CheckCircle size={14} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            {detail}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>How to exercise:</strong> Email dpo@skymapper.com with your request and proof of identity.
                          We will respond within {right.timeframe} as required by GDPR Article 12.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Data We Process */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Database size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Personal Data We Process</h2>
          </div>

          <div className="space-y-6">
            {dataCategories.map((category, index) => {
              const Icon = category.icon;

              return (
                <div key={index} className="p-6 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-50">
                  <div className="flex items-start gap-4 mb-4">
                    <Icon size={20} className="text-[var(--button-text)] flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--sidebar-text)] mb-2">
                        {category.category}
                      </h3>
                      <p className="text-sm text-[var(--sidebar-text)] opacity-75 mb-3">
                        {category.purpose}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-[var(--sidebar-text)] mb-2">Data Types:</h4>
                      <ul className="space-y-1">
                        {category.data.map((item, idx) => (
                          <li key={idx} className="text-[var(--sidebar-text)] opacity-70">• {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-[var(--sidebar-text)] mb-2">Legal Basis:</h4>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        category.legal_basis === 'Contract performance'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      }`}>
                        {category.legal_basis}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-medium text-[var(--sidebar-text)] mb-2">Retention:</h4>
                      <p className="text-[var(--sidebar-text)] opacity-70">{category.retention}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-[var(--sidebar-text)] mb-2">Your Control:</h4>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded text-xs">
                          Access
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded text-xs">
                          Export
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded text-xs">
                          Delete
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Processing Activities */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Settings size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Processing Activities Record</h2>
          </div>

          <div className="space-y-6">
            <p className="text-[var(--sidebar-text)] opacity-75">
              In compliance with GDPR Article 30, here is our record of processing activities:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-[var(--sidebar-border)] rounded-lg">
                <thead className="bg-[var(--sidebar-bg)] bg-opacity-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Processing Activity</th>
                    <th className="text-left py-3 px-4 font-medium">Data Types</th>
                    <th className="text-left py-3 px-4 font-medium">Legal Basis</th>
                    <th className="text-left py-3 px-4 font-medium">Recipients</th>
                    <th className="text-left py-3 px-4 font-medium">Transfers</th>
                  </tr>
                </thead>
                <tbody>
                  {processingActivities.map((activity, index) => (
                    <tr key={index} className="border-t border-[var(--sidebar-border)]">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-[var(--sidebar-text)]">{activity.activity}</div>
                          <div className="text-xs text-[var(--sidebar-text)] opacity-60 mt-1">{activity.purpose}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {activity.data_types.map((type, idx) => (
                            <div key={idx} className="text-[var(--sidebar-text)] opacity-70 text-xs">• {type}</div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          activity.legal_basis === 'Contract performance'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        }`}>
                          {activity.legal_basis}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[var(--sidebar-text)] opacity-70">{activity.recipients}</td>
                      <td className="py-4 px-4 text-[var(--sidebar-text)] opacity-70">{activity.transfers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Legal Basis */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Scale size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Legal Basis for Processing</h2>
          </div>

          <div className="space-y-6">
            <p className="text-[var(--sidebar-text)]">
              Under GDPR Article 6, we process your personal data based on the following legal grounds:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                  <CheckCircle size={18} />
                  Contract Performance (Art. 6(1)(b))
                </h3>
                <div className="space-y-3 text-sm text-green-700 dark:text-green-300">
                  <p><strong>What:</strong> Processing necessary to provide SkyMapper services</p>
                  <p><strong>Examples:</strong> Account management, flight planning features, customer support</p>
                  <p><strong>Your control:</strong> You can request deletion, but this may end your service access</p>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                  <Info size={18} />
                  Legitimate Interest (Art. 6(1)(f))
                </h3>
                <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
                  <p><strong>What:</strong> Processing for our legitimate business interests</p>
                  <p><strong>Examples:</strong> Analytics, security, service improvement, fraud prevention</p>
                  <p><strong>Your control:</strong> You can object to this processing at any time</p>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20">
                <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                  <UserCheck size={18} />
                  Consent (Art. 6(1)(a))
                </h3>
                <div className="space-y-3 text-sm text-purple-700 dark:text-purple-300">
                  <p><strong>What:</strong> Processing based on your explicit consent</p>
                  <p><strong>Examples:</strong> Marketing cookies, personalized recommendations, newsletters</p>
                  <p><strong>Your control:</strong> Withdraw consent anytime through our consent manager</p>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
                <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-3 flex items-center gap-2">
                  <Lock size={18} />
                  Legal Obligation (Art. 6(1)(c))
                </h3>
                <div className="space-y-3 text-sm text-orange-700 dark:text-orange-300">
                  <p><strong>What:</strong> Processing required by law</p>
                  <p><strong>Examples:</strong> Tax records, legal compliance, regulatory requirements</p>
                  <p><strong>Your control:</strong> Limited - we must comply with legal requirements</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Transfers */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Globe size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">International Data Transfers</h2>
          </div>

          <div className="space-y-6">
            <p className="text-[var(--sidebar-text)]">
              We may transfer your personal data outside the European Economic Area (EEA) under the following safeguards:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">Adequacy Decisions</h3>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Countries with EU-recognized data protection</li>
                  <li>• No additional safeguards required</li>
                  <li>• Same level of protection as in EU</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Standard Contractual Clauses</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• EU Commission approved contracts</li>
                  <li>• Binding data protection obligations</li>
                  <li>• Enforceable rights for data subjects</li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-30">
              <h3 className="font-semibold text-[var(--sidebar-text)] mb-3">Current Transfer Recipients:</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--sidebar-border)]">
                      <th className="text-left py-2 pr-4">Service Provider</th>
                      <th className="text-left py-2 pr-4">Location</th>
                      <th className="text-left py-2 pr-4">Purpose</th>
                      <th className="text-left py-2">Safeguard</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--sidebar-border)] border-opacity-30">
                      <td className="py-2 pr-4 font-medium">Google Analytics</td>
                      <td className="py-2 pr-4">United States</td>
                      <td className="py-2 pr-4">Usage analytics</td>
                      <td className="py-2">Adequacy decision + Anonymization</td>
                    </tr>
                    <tr className="border-b border-[var(--sidebar-border)] border-opacity-30">
                      <td className="py-2 pr-4 font-medium">Weather Data API</td>
                      <td className="py-2 pr-4">United States</td>
                      <td className="py-2 pr-4">Weather information</td>
                      <td className="py-2">Standard Contractual Clauses</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">CDN Services</td>
                      <td className="py-2 pr-4">Global</td>
                      <td className="py-2 pr-4">Content delivery</td>
                      <td className="py-2">Data Processing Agreements</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Data Breach Procedures */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Data Breach Response</h2>
          </div>

          <div className="space-y-6">
            <p className="text-[var(--sidebar-text)]">
              In compliance with GDPR Article 33 & 34, our data breach response procedure:
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3">Within 72 Hours</h3>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• Assess breach severity and scope</li>
                  <li>• Notify supervisory authority (if required)</li>
                  <li>• Document breach details</li>
                  <li>• Begin containment measures</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
                <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-3">Individual Notification</h3>
                <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  <li>• High-risk breaches require direct notification</li>
                  <li>• Clear description of what happened</li>
                  <li>• Recommendations for protection</li>
                  <li>• Contact information for questions</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">Post-Breach Actions</h3>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Full security review and updates</li>
                  <li>• Staff training and awareness</li>
                  <li>• Process improvements</li>
                  <li>• Regulatory cooperation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact and Complaints */}
        <section className="p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Mail size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Exercise Your Rights</h2>
          </div>

          <div className="space-y-6">
            <p className="text-[var(--sidebar-text)]">
              To exercise any of your data protection rights or file a complaint:
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-4">Contact Us Directly</h3>
                <div className="space-y-3 text-sm text-green-700 dark:text-green-300">
                  <div><strong>Data Protection Officer:</strong> dpo@skymapper.com</div>
                  <div><strong>Privacy Team:</strong> privacy@skymapper.com</div>
                  <div><strong>Response Time:</strong> Within 1 month (GDPR Article 12)</div>
                  <div><strong>Urgent Matters:</strong> Within 72 hours</div>
                  <div><strong>Languages:</strong> English, with translation available</div>
                </div>

                <div className="mt-4 p-3 bg-green-100 dark:bg-green-800/30 rounded">
                  <p className="text-xs text-green-800 dark:text-green-200">
                    <strong>Required Information:</strong> Include your full name, email address used with SkyMapper,
                    specific request details, and proof of identity for security.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-4">Lodge a Complaint</h3>
                <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
                  <div><strong>Right to Complain:</strong> File with your national supervisory authority</div>
                  <div><strong>EU Data Protection Board:</strong> Lists all EU authorities</div>
                  <div><strong>No Cost:</strong> Filing complaints is free of charge</div>
                  <div><strong>No Prerequisite:</strong> You do not need to contact us first</div>
                  <div><strong>Legal Remedies:</strong> Right to judicial remedies</div>
                </div>

                <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Lead Authority:</strong> [Your Lead Supervisory Authority] has jurisdiction
                    for cross-border processing complaints involving SkyMapper.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-8 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
              <p className="text-sm text-[var(--sidebar-text)] opacity-75">
                We are committed to resolving any data protection concerns quickly and transparently.
                Your rights are important to us, and we will work with you to address any issues.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
export default DataProtectionPolicy;
