// src/pages/legal/TermsOfService.tsx
import React from "react";
import { useTheme } from "@/src/utils/ThemeContext";
import {
  FileText,
  AlertTriangle,
  Scale,
  Shield,
  Plane,
  Navigation,
  Cloud,
  Users,
  Globe,
  Lock,
  Clock,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";

export const TermsOfService: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${`gradient-${theme}`} py-8`}>
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <FileText size={40} className="text-[var(--button-text)]" />
            <div>
              <h1 className="text-4xl font-bold text-[var(--sidebar-text)]">
                Terms of Service
              </h1>
              <p className="text-[var(--sidebar-text)] opacity-75 mt-2">
                Legal agreement for using SkyMapper flight planning services
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
              <Scale size={14} />
              Legally binding agreement
            </span>
          </div>
        </div>

        {/* Critical Aviation Disclaimer - Prominent */}
        <div className="mb-12 p-8 rounded-xl border-4 border-red-600 bg-red-50 dark:bg-red-900/30 shadow-2xl">
          <div className="flex items-start gap-6">
            <AlertTriangle size={36} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-2" />
            <div>
              <h2 className="text-3xl font-bold text-red-800 dark:text-red-200 mb-6 flex items-center gap-3">
                <Plane size={28} />
                CRITICAL AVIATION SAFETY NOTICE
              </h2>

              <div className="space-y-6 text-red-800 dark:text-red-200">
                <div className="text-xl font-bold p-4 bg-red-100 dark:bg-red-800/30 rounded-lg border-2 border-red-300 dark:border-red-600">
                  ⚠️ SkyMapper is NOT APPROVED for actual flight operations and should NEVER be used as primary navigation equipment.
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <XCircle size={20} />
                      What SkyMapper IS NOT:
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li>• NOT certified aviation navigation software</li>
                      <li>• NOT approved by aviation authorities (FAA, EASA, etc.)</li>
                      <li>• NOT suitable for IFR or commercial operations</li>
                      <li>• NOT a replacement for official charts and NOTAMs</li>
                      <li>• NOT guaranteed to be accurate or current</li>
                      <li>• NOT responsible for flight safety decisions</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <CheckCircle size={20} />
                      What SkyMapper IS:
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li>• A PLANNING TOOL for preliminary route analysis</li>
                      <li>• Educational software for flight training</li>
                      <li>• A reference for initial flight preparation</li>
                      <li>• Support tool for certified flight planning systems</li>
                      <li>• Academic resource for aviation education</li>
                      <li>• Hobby tool for simulation and learning</li>
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg">
                  <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-3 text-lg">
                    MANDATORY PILOT RESPONSIBILITIES:
                  </h3>
                  <ul className="text-yellow-800 dark:text-yellow-200 space-y-1 text-sm">
                    <li>✓ ALWAYS verify ALL information with official aviation sources</li>
                    <li>✓ Check current NOTAMs, weather reports, and airspace restrictions</li>
                    <li>✓ Use only certified navigation equipment for actual flight</li>
                    <li>✓ Maintain current pilot certifications and medical certificates</li>
                    <li>✓ Comply with all applicable aviation regulations</li>
                    <li>✓ File official flight plans with appropriate authorities</li>
                    <li>✓ Conduct proper pre-flight planning and briefings</li>
                  </ul>
                </div>

                <div className="text-center p-4 bg-red-200 dark:bg-red-800/50 rounded-lg border-2 border-red-400 dark:border-red-600">
                  <p className="font-bold text-xl text-red-900 dark:text-red-100">
                    BY USING SKYMAPPER, YOU ACKNOWLEDGE COMPLETE AND SOLE RESPONSIBILITY
                    FOR ALL FLIGHT-RELATED DECISIONS AND SAFETY.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acceptance of Terms */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <FileText size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">1. Acceptance of Terms</h2>
          </div>

          <div className="space-y-4 text-[var(--sidebar-text)]">
            <p>
              By accessing, downloading, or using SkyMapper, you accept and agree to be bound by the terms and provisions
              of this agreement. These Terms of Service apply to all visitors, users, and others who access or use the service.
            </p>
            <p>
              <strong>If you do not agree to these terms, you must not use SkyMapper.</strong> Your continued use of the
              service constitutes acceptance of any modifications to these terms.
            </p>

            <div className="p-4 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
              <p className="text-blue-800 dark:text-blue-200 font-medium">
                <Info className="inline mr-2" size={16} />
                These terms are legally binding. Please read them carefully and consult legal counsel if needed.
              </p>
            </div>
          </div>
        </section>

        {/* Service Description */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Plane size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">2. Description of Service</h2>
          </div>

          <div className="space-y-6">
            <p className="text-[var(--sidebar-text)]">
              SkyMapper is a web-based flight planning application designed for educational and preliminary planning purposes.
              The service provides the following features for authorized users:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
                  <Navigation size={18} />
                  Planning Features
                </h3>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
                  <li>• Route planning and waypoint management</li>
                  <li>• Distance and bearing calculations</li>
                  <li>• Fuel consumption estimates</li>
                  <li>• Flight time predictions</li>
                  <li>• Basic navigation calculations</li>
                  <li>• Flight plan export capabilities</li>
                </ul>
              </div>

              <div className="p-6 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                  <Cloud size={18} />
                  Data Integration
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <li>• Third-party weather data integration</li>
                  <li>• Mapping and visualization services</li>
                  <li>• Airport and navaid databases</li>
                  <li>• Airspace information display</li>
                  <li>• Educational content and resources</li>
                  <li>• User preference management</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* User Responsibilities */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Users size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">3. User Responsibilities and Obligations</h2>
          </div>

          <div className="space-y-6">
            <p className="text-[var(--sidebar-text)]">
              As a user of SkyMapper, you acknowledge and agree to the following responsibilities:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-3">Aviation Compliance</h3>
                  <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                    <li>• Maintain current pilot licenses and ratings</li>
                    <li>• Comply with all aviation regulations</li>
                    <li>• Use certified equipment for actual flights</li>
                    <li>• Verify all data with official sources</li>
                    <li>• File proper flight plans with authorities</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">Account Security</h3>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                    <li>• Maintain confidentiality of login credentials</li>
                    <li>• Use strong, unique passwords</li>
                    <li>• Report unauthorized access immediately</li>
                    <li>• Keep contact information current</li>
                    <li>• Log out from shared devices</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                  <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3">Prohibited Uses</h3>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• Using as primary navigation system</li>
                    <li>• Commercial operations without certification</li>
                    <li>• Illegal or unauthorized activities</li>
                    <li>• Sharing accounts or credentials</li>
                    <li>• Reverse engineering or hacking</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">Proper Usage</h3>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Use only for planning and educational purposes</li>
                    <li>• Report bugs and inaccuracies promptly</li>
                    <li>• Respect intellectual property rights</li>
                    <li>• Follow community guidelines</li>
                    <li>• Use reasonable judgment and caution</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-10 p-8 rounded-xl border-2 border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-3 mb-6">
            <Scale size={24} className="text-red-600 dark:text-red-400" />
            <h2 className="text-2xl font-semibold text-red-800 dark:text-red-200">4. Limitation of Liability</h2>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-red-100 dark:bg-red-800/30 rounded-lg border-2 border-red-300 dark:border-red-600">
              <p className="font-bold text-red-900 dark:text-red-100 text-lg mb-4">
                CRITICAL LEGAL NOTICE - PLEASE READ CAREFULLY
              </p>
              <p className="text-red-800 dark:text-red-200">
                The following limitations are essential to understand your legal relationship with SkyMapper
                and the extent of our liability for the services provided.
              </p>
            </div>

            <div className="space-y-4 text-red-800 dark:text-red-200">
              <div className="p-4 border-2 border-red-400 dark:border-red-600 rounded-lg">
                <h3 className="font-bold text-xl mb-3">COMPLETE DISCLAIMER OF LIABILITY</h3>
                <p className="font-semibold mb-2">
                  IN NO EVENT SHALL SKYMAPPER, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, CONTRACTORS,
                  LICENSORS, OR AFFILIATES BE LIABLE FOR ANY:
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="font-semibold mb-2">Types of Damages:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Direct, indirect, or consequential damages</li>
                      <li>• Incidental, special, or punitive damages</li>
                      <li>• Loss of profits, revenue, or business</li>
                      <li>• Loss of data or information</li>
                      <li>• Personal injury or property damage</li>
                      <li>• Death or bodily harm</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Aviation-Specific Exclusions:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Aircraft accidents or incidents</li>
                      <li>• Navigation errors or miscalculations</li>
                      <li>• Weather-related incidents or decisions</li>
                      <li>• Fuel miscalculations or shortages</li>
                      <li>• Airspace violations or regulatory issues</li>
                      <li>• Emergency situations or diversions</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-red-400 dark:border-red-600 rounded-lg">
                <h3 className="font-bold text-lg mb-2">MAXIMUM LIABILITY CAP</h3>
                <p className="text-sm">
                  To the extent permitted by law, our total liability to you for all claims arising from or relating to
                  SkyMapper shall not exceed the amount you paid us (if any) in the twelve months preceding the claim,
                  or $100 USD, whichever is greater.
                </p>
              </div>

              <div className="text-center p-4 bg-red-200 dark:bg-red-800/50 rounded-lg border-2 border-red-500 dark:border-red-600">
                <p className="font-bold text-xl text-red-900 dark:text-red-100">
                  YOU ASSUME ALL RISKS AND RESPONSIBILITY FOR YOUR USE OF SKYMAPPER.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Accuracy Disclaimer */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">5. Data Accuracy and Service Availability</h2>
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">No Warranties on Data Accuracy</h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                SkyMapper aggregates data from various third-party sources. We make no warranties regarding the
                accuracy, completeness, timeliness, or reliability of any information provided.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-[var(--sidebar-text)] mb-4">Data Limitations Include:</h3>
                <ul className="space-y-2 text-[var(--sidebar-text)] text-sm">
                  <li className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Weather data:</strong> May be delayed, incomplete, or inaccurate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Navigation calculations:</strong> Estimates only, not certified</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Airport information:</strong> May not reflect current conditions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Airspace data:</strong> Subject to constant changes and NOTAMs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Fuel calculations:</strong> Estimates based on generic aircraft data</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--sidebar-text)] mb-4">Service Availability:</h3>
                <ul className="space-y-2 text-[var(--sidebar-text)] text-sm">
                  <li className="flex items-start gap-2">
                    <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Service availability not guaranteed 24/7</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Maintenance windows may cause interruptions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Third-party data providers may experience outages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Performance may vary based on usage and location</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Features may be modified or discontinued</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-lg border-2 border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20">
              <p className="font-bold text-orange-800 dark:text-orange-200 text-center">
                ALWAYS CROSS-REFERENCE ALL INFORMATION WITH OFFICIAL AVIATION SOURCES
              </p>
            </div>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Lock size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">6. Intellectual Property Rights</h2>
          </div>

          <div className="space-y-4 text-[var(--sidebar-text)]">
            <p>
              SkyMapper and all related content, features, and functionality are owned by us or our licensors
              and are protected by copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">You May:</h3>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Use SkyMapper for personal, educational purposes</li>
                  <li>• Export your own flight plans and data</li>
                  <li>• Share screenshots for educational purposes</li>
                  <li>• Link to our public pages</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3">You May NOT:</h3>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• Copy, modify, or distribute our software</li>
                  <li>• Reverse engineer or decompile the application</li>
                  <li>• Remove copyright or proprietary notices</li>
                  <li>• Use our trademarks without permission</li>
                  <li>• Create derivative works</li>
                  <li>• Resell or redistribute the service</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Termination */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <XCircle size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">7. Termination</h2>
          </div>

          <div className="space-y-4 text-[var(--sidebar-text)]">
            <p>
              We reserve the right to terminate or suspend your access to SkyMapper immediately, without prior notice
              or liability, for any reason whatsoever, including without limitation if you breach these Terms.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-30">
                <h3 className="font-semibold mb-3">Reasons for Termination:</h3>
                <ul className="text-sm space-y-1">
                  <li>• Violation of these Terms of Service</li>
                  <li>• Fraudulent or illegal activities</li>
                  <li>• Misuse of the service or data</li>
                  <li>• Security violations or hacking attempts</li>
                  <li>• Non-payment (if applicable)</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-30">
                <h3 className="font-semibold mb-3">Effect of Termination:</h3>
                <ul className="text-sm space-y-1">
                  <li>• Immediate loss of access to services</li>
                  <li>• Deletion of account data (subject to legal requirements)</li>
                  <li>• Continued applicability of liability limitations</li>
                  <li>• Right to export personal data before deletion</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Governing Law */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Scale size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">8. Governing Law and Disputes</h2>
          </div>

          <div className="space-y-4 text-[var(--sidebar-text)]">
            <p>
              These Terms shall be interpreted and governed by the laws of [Your Jurisdiction], without regard to its
              conflict of law provisions. Any disputes arising from these Terms or your use of SkyMapper will be
              subject to the exclusive jurisdiction of the courts in [Your Jurisdiction].
            </p>

            <div className="p-4 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Dispute Resolution Process:</h3>
              <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal pl-4">
                <li>Contact our support team for informal resolution</li>
                <li>Attempt mediation if informal resolution fails</li>
                <li>Binding arbitration for claims under $10,000</li>
                <li>Court proceedings for larger claims or injunctive relief</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <FileText size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">9. Modifications to Terms</h2>
          </div>

          <div className="space-y-4 text-[var(--sidebar-text)]">
            <p>
              We reserve the right to modify these Terms of Service at any time. We will provide notice of material
              changes through the application, email notifications, or prominent notices on our website.
            </p>

            <div className="p-4 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-30">
              <h3 className="font-semibold mb-3">How We Notify You of Changes:</h3>
              <ul className="text-sm space-y-1">
                <li>• In-app notifications for significant changes</li>
                <li>• Email notifications to registered users</li>
                <li>• Updated Last modified date on this page</li>
                <li>• Prominent website notices for major revisions</li>
                <li>• 30-day advance notice for material changes affecting liability</li>
              </ul>
              <p className="text-sm mt-3 font-medium">
                Your continued use after changes indicates acceptance of the new terms.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Globe size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">10. Contact Information</h2>
          </div>

          <div className="space-y-4 text-[var(--sidebar-text)]">
            <p>
              For questions about these Terms of Service, legal matters, or to report violations, please contact us:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-30">
                <h3 className="font-semibold mb-3">Legal Department</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> legal@skymapper.com</p>
                  <p><strong>Subject Line:</strong> Terms of Service Inquiry</p>
                  <p><strong>Response Time:</strong> 5-10 business days</p>
                  <p><strong>Languages:</strong> English (primary)</p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-30">
                <h3 className="font-semibold mb-3">Compliance Officer</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>For:</strong> Aviation safety concerns</p>
                  <p><strong>Email:</strong> compliance@skymapper.com</p>
                  <p><strong>Emergency:</strong> Critical safety issues</p>
                  <p><strong>Privacy:</strong> All reports treated confidentially</p>
                </div>
              </div>
            </div>

            <div className="text-center text-sm opacity-75 mt-6 pt-4 border-t border-[var(--sidebar-border)]">
              <p>
                These Terms of Service constitute the entire agreement between you and SkyMapper regarding the use of our services.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
export default TermsOfService;
