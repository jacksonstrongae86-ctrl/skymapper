// src/pages/legal/PrivacyPolicy.tsx
import React from "react";
import { useTheme } from "@/src/utils/ThemeContext";
import {
  Shield,
  Database,
  Eye,
  Clock,
  Globe,
  Mail,
  AlertTriangle,
  Users,
  Lock,
  Share,
  Settings,
  FileText,
  CheckCircle
} from "lucide-react";

export const PrivacyPolicy: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${`gradient-${theme}`} py-8`}>
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <Shield size={40} className="text-[var(--button-text)]" />
            <div>
              <h1 className="text-4xl font-bold text-[var(--sidebar-text)]">
                Privacy Policy
              </h1>
              <p className="text-[var(--sidebar-text)] opacity-75 mt-2">
                How SkyMapper protects and handles your personal information
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
              Effective globally
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle size={14} />
              GDPR & CCPA compliant
            </span>
          </div>
        </div>

        {/* Aviation Safety Warning */}
        <div className="mb-10 p-6 rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start gap-4">
            <AlertTriangle size={28} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-3">
                CRITICAL AVIATION DISCLAIMER
              </h2>
              <div className="text-red-700 dark:text-red-300 space-y-2">
                <p className="font-semibold">
                  SkyMapper is NOT approved for actual flight operations and should NOT be used as primary navigation equipment.
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>This is a PLANNING TOOL ONLY - not certified aviation software</li>
                  <li>Weather data may be delayed, inaccurate, or incomplete</li>
                  <li>Navigation calculations are estimates and may contain errors</li>
                  <li>Always verify ALL information with official aviation authorities</li>
                  <li>Check current NOTAMs, weather reports, and airspace restrictions</li>
                  <li>Use certified navigation equipment and official charts for flight</li>
                </ul>
                <p className="font-semibold">
                  BY USING SKYMAPPER, YOU ACKNOWLEDGE FULL RESPONSIBILITY FOR ALL FLIGHT-RELATED DECISIONS.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-4">
            <Eye size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Introduction</h2>
          </div>
          <div className="space-y-4 text-[var(--sidebar-text)]">
            <p>
              SkyMapper (we, our, or us) is committed to protecting your privacy and ensuring the security
              of your personal information. This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our flight planning application and related services.
            </p>
            <p>
              By using SkyMapper, you consent to the data practices described in this policy. If you do not
              agree with our policies and practices, please do not use our services.
            </p>
          </div>
        </section>

        {/* Information Collection */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Database size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Information We Collect</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-50">
              <h3 className="font-semibold text-[var(--sidebar-text)] mb-4 flex items-center gap-2">
                <Users size={18} />
                Personal Information
              </h3>
              <ul className="space-y-2 text-[var(--sidebar-text)]">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--button-bg)] flex-shrink-0 mt-2"></span>
                  <span>Email address (if you create an account)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--button-bg)] flex-shrink-0 mt-2"></span>
                  <span>Flight planning data (routes, waypoints, aircraft details)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--button-bg)] flex-shrink-0 mt-2"></span>
                  <span>Usage preferences and application settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--button-bg)] flex-shrink-0 mt-2"></span>
                  <span>Device information and browser type</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--button-bg)] flex-shrink-0 mt-2"></span>
                  <span>Location data (for weather and navigation services)</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-50">
              <h3 className="font-semibold text-[var(--sidebar-text)] mb-4 flex items-center gap-2">
                <Settings size={18} />
                Automatically Collected
              </h3>
              <ul className="space-y-2 text-[var(--sidebar-text)]">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--button-bg)] flex-shrink-0 mt-2"></span>
                  <span>IP address and general location data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--button-bg)] flex-shrink-0 mt-2"></span>
                  <span>Usage analytics and performance metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--button-bg)] flex-shrink-0 mt-2"></span>
                  <span>Cookies and similar tracking technologies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--button-bg)] flex-shrink-0 mt-2"></span>
                  <span>Error logs and diagnostic information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--button-bg)] flex-shrink-0 mt-2"></span>
                  <span>Session data and interaction patterns</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Information */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Globe size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">How We Use Your Information</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">Service Provision</h3>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Provide and maintain SkyMapper services</li>
                <li>• Process flight planning calculations</li>
                <li>• Deliver weather data and navigation info</li>
                <li>• Save and sync your flight plans</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Improvement</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Analyze usage to enhance user experience</li>
                <li>• Develop new features and functionality</li>
                <li>• Optimize performance and reliability</li>
                <li>• Conduct research and analytics</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">Communication & Security</h3>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                <li>• Send important updates and notifications</li>
                <li>• Provide customer support</li>
                <li>• Ensure security and prevent fraud</li>
                <li>• Comply with legal obligations</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Sharing */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Share size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Information Sharing and Disclosure</h2>
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-50">
              <h3 className="font-semibold text-[var(--sidebar-text)] mb-2">We DO NOT sell your personal information.</h3>
              <p className="text-[var(--sidebar-text)] opacity-80">
                Your data is never sold to third parties for marketing or commercial purposes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[var(--sidebar-text)] mb-4">We may share information in these limited circumstances:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Service Providers</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Third-party services that help us operate SkyMapper (weather data, mapping, analytics) under strict privacy agreements.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Legal Requirements</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    When required by law, legal process, or to protect rights, property, and safety of users and the public.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Lock size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Data Security</h2>
          </div>

          <div className="space-y-4 text-[var(--sidebar-text)]">
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Technical Safeguards:</h3>
                <ul className="space-y-1 text-sm opacity-80">
                  <li>• SSL/TLS encryption for data transmission</li>
                  <li>• Encrypted data storage</li>
                  <li>• Regular security audits and testing</li>
                  <li>• Access controls and authentication</li>
                  <li>• Monitoring and logging systems</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Organizational Measures:</h3>
                <ul className="space-y-1 text-sm opacity-80">
                  <li>• Employee privacy training</li>
                  <li>• Data access on need-to-know basis</li>
                  <li>• Regular policy reviews and updates</li>
                  <li>• Incident response procedures</li>
                  <li>• Third-party security assessments</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Clock size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Data Retention</h2>
          </div>

          <div className="space-y-4 text-[var(--sidebar-text)]">
            <p>
              We retain your personal information only as long as necessary for the purposes outlined in this policy or as required by law.
            </p>

            <div className="p-4 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-30">
              <h3 className="font-semibold mb-3">Retention Periods:</h3>
              <ul className="space-y-2 text-sm">
                <li><strong>Account data:</strong> Until account deletion + 30 days</li>
                <li><strong>Flight plans:</strong> 2 years after last access</li>
                <li><strong>Usage analytics:</strong> 18 months (anonymized after 6 months)</li>
                <li><strong>Security logs:</strong> 1 year</li>
                <li><strong>Cookie data:</strong> As specified in cookie settings (up to 1 year)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Your Privacy Rights</h2>
          </div>

          <div className="space-y-6">
            <p className="text-[var(--sidebar-text)]">
              Depending on your location, you may have certain rights regarding your personal data under GDPR, CCPA, and other privacy laws:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Access & Portability</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Right to access your personal data</li>
                  <li>• Right to data portability</li>
                  <li>• Right to know what data we have</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Control & Correction</h3>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Right to rectify inaccurate data</li>
                  <li>• Right to restrict processing</li>
                  <li>• Right to object to processing</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Deletion & Consent</h3>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• Right to erasure (right to be forgotten)</li>
                  <li>• Right to withdraw consent</li>
                  <li>• Right to delete account and data</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20">
                <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Legal Protections</h3>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                  <li>• Right to lodge complaints</li>
                  <li>• Right to legal remedies</li>
                  <li>• Protection from discrimination</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Mail size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Contact Us</h2>
          </div>

          <div className="space-y-4 text-[var(--sidebar-text)]">
            <p>
              For privacy-related questions, to exercise your rights, or to report concerns, please contact us:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-30">
                <h3 className="font-semibold mb-3">Privacy Officer</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> privacy@skymapper.com</p>
                  <p><strong>Response Time:</strong> Within 30 days</p>
                  <p><strong>Languages:</strong> English, with translation available</p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-30">
                <h3 className="font-semibold mb-3">Data Protection</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>EU Representative:</strong> Available for GDPR matters</p>
                  <p><strong>Supervisory Authority:</strong> You may lodge complaints</p>
                  <p><strong>Emergency:</strong> For urgent security matters</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Updates to Policy */}
        <section className="p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-4">
            <FileText size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Changes to This Policy</h2>
          </div>

          <div className="space-y-4 text-[var(--sidebar-text)]">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Posting the updated policy on this page</li>
              <li>Updating the Last updated date</li>
              <li>Sending email notifications for significant changes</li>
              <li>Displaying in-app notifications</li>
            </ul>
            <p>
              Your continued use of SkyMapper after any changes indicates your acceptance of the updated policy.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
export default PrivacyPolicy;
