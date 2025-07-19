// src/pages/legal/DisclaimerPolicy.tsx
import React from "react";
import { useTheme } from "@/src/utils/ThemeContext";
import {
  AlertTriangle,
  Navigation,
  Cloud,
  Fuel,
  Map,
  Clock,
  Globe,
  Shield,
  XCircle,
  CheckCircle,
  Info,
  Database,
  Scale,
  Users,
} from "lucide-react";

export const DisclaimerPolicy: React.FC = () => {
  const { theme } = useTheme();

  const riskCategories = [
    {
      title: "Navigation & Route Planning",
      icon: Navigation,
      color: "red",
      risks: [
        "Calculated routes may not account for restricted airspace",
        "NOTAMs and temporary flight restrictions not included",
        "Navigation accuracy dependent on data sources",
        "Magnetic variation calculations may be outdated",
        "GPS coordinates subject to datum and projection errors"
      ],
      recommendations: [
        "Always use current official aeronautical charts",
        "Check NOTAMs before every flight",
        "Verify restricted and prohibited areas",
        "Cross-check all coordinates with official sources",
        "Use certified GPS and navigation equipment"
      ]
    },
    {
      title: "Weather Information",
      icon: Cloud,
      color: "orange",
      risks: [
        "Weather data may be delayed or incomplete",
        "Forecast accuracy decreases over time",
        "Localized weather conditions not captured",
        "Rapidly changing weather not reflected",
        "Icing, turbulence, and visibility estimates unreliable"
      ],
      recommendations: [
        "Obtain official weather briefings",
        "Use multiple weather sources",
        "Monitor weather continuously during flight",
        "Have alternate plans for weather changes",
        "Never fly in conditions beyond your capabilities"
      ]
    },
    {
      title: "Aircraft Performance",
      icon: Fuel,
      color: "yellow",
      risks: [
        "Fuel calculations based on generic aircraft data",
        "Performance affected by weight, altitude, temperature",
        "Engine condition and efficiency not considered",
        "Wind and weather impact on fuel consumption",
        "Reserve fuel requirements may be inadequate"
      ],
      recommendations: [
        "Use your aircraft's actual performance data",
        "Calculate fuel requirements with appropriate reserves",
        "Consider all factors affecting performance",
        "Monitor fuel consumption during flight",
        "Have alternate airports identified"
      ]
    },
    {
      title: "Airspace & Regulations",
      icon: Map,
      color: "blue",
      risks: [
        "Airspace classifications may be outdated",
        "Special use airspace changes not reflected",
        "International regulations not fully covered",
        "Military operations areas not current",
        "Temporary flight restrictions not included"
      ],
      recommendations: [
        "Consult current sectional charts",
        "Check for TFRs and NOTAMs",
        "Understand all applicable regulations",
        "Contact ATC for current airspace information",
        "File and follow approved flight plans"
      ]
    }
  ];

  const aviationAuthorities = [
    {
      region: "United States",
      authority: "Federal Aviation Administration (FAA)",
      website: "faa.gov",
      services: ["NOTAMs", "Weather", "Charts", "Regulations", "Flight Service"]
    },
    {
      region: "European Union",
      authority: "European Union Aviation Safety Agency (EASA)",
      website: "easa.europa.eu",
      services: ["Safety Information", "Regulations", "Airworthiness", "Licensing"]
    },
    {
      region: "Canada",
      authority: "Transport Canada",
      website: "tc.gc.ca",
      services: ["NOTAMs", "Weather", "AIM", "Regulations", "Flight Planning"]
    },
    {
      region: "United Kingdom",
      authority: "Civil Aviation Authority (CAA)",
      website: "caa.co.uk",
      services: ["NOTAMs", "AIP", "Weather", "Safety", "Licensing"]
    },
    {
      region: "Australia",
      authority: "Civil Aviation Safety Authority (CASA)",
      website: "casa.gov.au",
      services: ["NOTAMs", "NAIPS", "Weather", "Regulations", "Safety"]
    },
    {
      region: "International",
      authority: "International Civil Aviation Organization (ICAO)",
      website: "icao.int",
      services: ["Standards", "Global Aviation", "Safety", "Security"]
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { border: string; bg: string; text: string }> = {
      red: {
        border: "border-red-400 dark:border-red-600",
        bg: "bg-red-50 dark:bg-red-900/20",
        text: "text-red-800 dark:text-red-200",
      },
      orange: {
        border: "border-orange-400 dark:border-orange-600",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        text: "text-orange-800 dark:text-orange-200",
      },
      yellow: {
        border: "border-yellow-400 dark:border-yellow-600",
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        text: "text-yellow-800 dark:text-yellow-200",
      },
      blue: {
        border: "border-blue-400 dark:border-blue-600",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        text: "text-blue-800 dark:text-blue-200",
      },
    };
    return colorMap[color] || colorMap.red;
  };

  return (
    <div className={`min-h-screen ${`gradient-${theme}`} py-8`}>
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <AlertTriangle size={40} className="text-red-600 dark:text-red-400" />
            <div>
              <h1 className="text-4xl font-bold text-[var(--sidebar-text)]">
                Aviation Disclaimer & Limitations
              </h1>
              <p className="text-[var(--sidebar-text)] opacity-75 mt-2">
                Critical safety information and liability limitations for SkyMapper users
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
              Applies to all aviation activities
            </span>
            <span className="flex items-center gap-1">
              <Scale size={14} />
              Legally binding limitations
            </span>
          </div>
        </div>

        {/* Critical Warning Banner */}
        <div className="mb-12 p-8 rounded-xl border-4 border-red-600 bg-red-50 dark:bg-red-900/30 shadow-2xl">
          <div className="text-center mb-6">
            <AlertTriangle size={48} className="text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-red-800 dark:text-red-200 mb-4">
              🚨 CRITICAL AVIATION SAFETY WARNING 🚨
            </h2>
          </div>

          <div className="space-y-6 text-red-800 dark:text-red-200">
            <div className="text-center p-6 bg-red-200 dark:bg-red-800/50 rounded-lg border-2 border-red-500 dark:border-red-600">
              <p className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
                ⚠️ SKYMAPPER IS NOT APPROVED FOR FLIGHT OPERATIONS ⚠️
              </p>
              <p className="text-lg font-semibold">
                THIS SOFTWARE IS FOR PLANNING AND EDUCATIONAL PURPOSES ONLY
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <XCircle size={24} />
                  ABSOLUTELY DO NOT USE FOR:
                </h3>
                <ul className="space-y-2 text-base">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 text-xl">•</span>
                    <span><strong>Primary navigation</strong> - Not certified for flight navigation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 text-xl">•</span>
                    <span><strong>IFR operations</strong> - No instrument approach procedures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 text-xl">•</span>
                    <span><strong>Commercial flights</strong> - Not approved by aviation authorities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 text-xl">•</span>
                    <span><strong>Emergency situations</strong> - May not have current information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 text-xl">•</span>
                    <span><strong>Sole source planning</strong> - Must verify with official sources</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CheckCircle size={24} />
                  APPROPRIATE USES INCLUDE:
                </h3>
                <ul className="space-y-2 text-base">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">•</span>
                    <span><strong>Initial planning</strong> - Preliminary route analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">•</span>
                    <span><strong>Education</strong> - Flight training and learning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">•</span>
                    <span><strong>Simulation</strong> - Desktop flight planning practice</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">•</span>
                    <span><strong>Research</strong> - Academic and educational purposes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">•</span>
                    <span><strong>Reference</strong> - Supporting certified planning tools</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-200 dark:bg-yellow-800/50 rounded-lg border-2 border-yellow-500 dark:border-yellow-600">
              <p className="font-bold text-xl text-yellow-900 dark:text-yellow-100 mb-2">
                PILOT RESPONSIBILITY ACKNOWLEDGMENT
              </p>
              <p className="text-yellow-800 dark:text-yellow-200">
                By using SkyMapper, you acknowledge that YOU ARE SOLELY RESPONSIBLE for all flight safety decisions,
                proper flight planning using certified sources, compliance with regulations, and ensuring aircraft airworthiness.
              </p>
            </div>
          </div>
        </div>

        {/* Data Accuracy Limitations */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Database size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Data Accuracy & Source Limitations</h2>
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20">
              <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-3">
                NO WARRANTIES ON DATA ACCURACY
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300">
                SkyMapper aggregates data from various third-party sources. We make NO WARRANTIES, EXPRESS OR IMPLIED,
                regarding the accuracy, completeness, timeliness, or reliability of any information provided.
                Aviation data changes frequently and our information may be outdated or incorrect.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {riskCategories.map((category, index) => {
                const Icon = category.icon;
                const colors = getColorClasses(category.color);

                return (
                  <div key={index} className={`p-6 rounded-xl border-2 ${colors.border} ${colors.bg}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <Icon size={24} className={colors.text.replace('text-', 'text-').replace(' dark:', ' dark:')} />
                      <h3 className={`text-xl font-bold ${colors.text}`}>{category.title}</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className={`font-semibold ${colors.text} mb-2`}>Known Risks & Limitations:</h4>
                        <ul className="space-y-1">
                          {category.risks.map((risk, riskIndex) => (
                            <li key={riskIndex} className={`text-sm ${colors.text} opacity-80 flex items-start gap-2`}>
                              <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className={`font-semibold ${colors.text} mb-2`}>Required Pilot Actions:</h4>
                        <ul className="space-y-1">
                          {category.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className={`text-sm ${colors.text} opacity-80 flex items-start gap-2`}>
                              <CheckCircle size={12} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Regulatory Compliance */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Scale size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Regulatory Compliance Disclaimer</h2>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg border-2 border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20">
              <h3 className="font-bold text-red-800 dark:text-red-200 mb-4 text-lg">
                NON-COMPLIANCE WITH AVIATION REGULATIONS
              </h3>
              <div className="space-y-4 text-red-700 dark:text-red-300">
                <p className="font-semibold">
                  SkyMapper is NOT certified, approved, or endorsed by any aviation authority including:
                </p>
                <ul className="grid md:grid-cols-2 gap-2 text-sm">
                  <li>• Federal Aviation Administration (FAA)</li>
                  <li>• European Union Aviation Safety Agency (EASA)</li>
                  <li>• Transport Canada Civil Aviation</li>
                  <li>• Civil Aviation Authority (CAA-UK)</li>
                  <li>• Civil Aviation Safety Authority (CASA-AU)</li>
                  <li>• International Civil Aviation Organization (ICAO)</li>
                </ul>
                <p className="font-semibold">
                  Use of SkyMapper does NOT satisfy any regulatory requirements for flight planning, navigation, or safety equipment.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-50">
                <h3 className="font-semibold text-[var(--sidebar-text)] mb-3">Pilot Responsibilities</h3>
                <ul className="space-y-2 text-[var(--sidebar-text)] text-sm">
                  <li>✓ Hold appropriate licenses and medical certificates</li>
                  <li>✓ Comply with all applicable regulations (Part 91, Part 135, etc.)</li>
                  <li>✓ Use only certified equipment for navigation</li>
                  <li>✓ Maintain aircraft airworthiness</li>
                  <li>✓ File official flight plans with authorities</li>
                  <li>✓ Conduct proper preflight planning and briefings</li>
                  <li>✓ Make PIC decisions based on certified sources</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-50">
                <h3 className="font-semibold text-[var(--sidebar-text)] mb-3">Required Official Sources</h3>
                <ul className="space-y-2 text-[var(--sidebar-text)] text-sm">
                  <li>✓ Current sectional and terminal area charts</li>
                  <li>✓ Official weather briefings and forecasts</li>
                  <li>✓ NOTAMs and flight service information</li>
                  <li>✓ Airport/Facility Directory (A/FD) or Chart Supplement</li>
                  <li>✓ Instrument approach procedures (if applicable)</li>
                  <li>✓ Airspace and special use airspace publications</li>
                  <li>✓ Certified GPS databases and equipment</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Official Aviation Authorities */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Globe size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Official Aviation Authorities</h2>
          </div>

          <div className="space-y-4">
            <p className="text-[var(--sidebar-text)]">
              Always consult these official aviation authorities for current, certified information:
            </p>

            <div className="grid gap-4">
              {aviationAuthorities.map((authority, index) => (
                <div key={index} className="p-4 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--sidebar-text)] mb-1">
                        {authority.authority}
                      </h3>
                      <p className="text-sm text-[var(--sidebar-text)] opacity-75 mb-2">
                        {authority.region}
                      </p>
                      <p className="text-sm text-[var(--button-bg)] font-mono">
                        {authority.website}
                      </p>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium text-[var(--sidebar-text)] mb-2 text-sm">Services:</h4>
                      <div className="flex flex-wrap gap-1">
                        {authority.services.map((service, serviceIndex) => (
                          <span key={serviceIndex} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
              <p className="text-green-800 dark:text-green-200 font-medium">
                <Info className="inline mr-2" size={16} />
                These official sources provide current, certified information required for legal flight operations.
                Always verify SkyMapper data against these authoritative sources.
              </p>
            </div>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-10 p-8 rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={24} className="text-red-600 dark:text-red-400" />
            <h2 className="text-2xl font-semibold text-red-800 dark:text-red-200">Complete Limitation of Liability</h2>
          </div>

          <div className="space-y-6 text-red-800 dark:text-red-200">
            <div className="p-6 bg-red-100 dark:bg-red-800/30 rounded-lg border-2 border-red-400 dark:border-red-600">
              <h3 className="font-bold text-xl mb-4">ABSOLUTE DISCLAIMER OF LIABILITY</h3>
              <p className="font-semibold mb-4">
                IN NO EVENT SHALL SKYMAPPER, ITS OWNERS, OPERATORS, DEVELOPERS, EMPLOYEES, AGENTS,
                CONTRACTORS, LICENSORS, OR AFFILIATES BE LIABLE FOR ANY DAMAGES WHATSOEVER ARISING FROM:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Aviation-Related Incidents:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Aircraft accidents or incidents</li>
                    <li>• Emergency situations or forced landings</li>
                    <li>• Navigation errors or getting lost</li>
                    <li>• Weather-related accidents or delays</li>
                    <li>• Fuel exhaustion or miscalculation</li>
                    <li>• Airspace violations or regulatory violations</li>
                    <li>• Equipment failures or malfunctions</li>
                    <li>• Collision with terrain, obstacles, or other aircraft</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Legal and Financial Consequences:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Death, injury, or property damage</li>
                    <li>• Loss of pilot certificates or ratings</li>
                    <li>• Regulatory enforcement actions or fines</li>
                    <li>• Legal proceedings or lawsuits</li>
                    <li>• Insurance claims or coverage issues</li>
                    <li>• Business losses or operational delays</li>
                    <li>• Consequential or punitive damages</li>
                    <li>• Any direct or indirect financial losses</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center p-6 bg-red-200 dark:bg-red-800/50 rounded-lg border-2 border-red-500 dark:border-red-600">
              <p className="font-bold text-2xl text-red-900 dark:text-red-100 mb-2">
                YOU ASSUME ALL RISKS
              </p>
              <p className="text-lg font-semibold">
                Your use of SkyMapper is entirely at your own risk. You acknowledge that aviation
                involves inherent dangers and that proper training, certified equipment, and sound
                judgment are essential for safe flight operations.
              </p>
            </div>
          </div>
        </section>

        {/* User Acknowledgment */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Users size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">User Acknowledgment Required</h2>
          </div>

          <div className="space-y-6">
            <p className="text-[var(--sidebar-text)]">
              By using SkyMapper, you explicitly acknowledge and agree that:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3">You Understand That:</h3>
                <ul className="space-y-2 text-red-700 dark:text-red-300 text-sm">
                  <li>✓ SkyMapper is not certified aviation software</li>
                  <li>✓ Information may be inaccurate or outdated</li>
                  <li>✓ This tool cannot replace proper flight planning</li>
                  <li>✓ You must verify all information independently</li>
                  <li>✓ Aviation safety is your sole responsibility</li>
                  <li>✓ Regulations and airspace can change without notice</li>
                  <li>✓ Weather conditions can be rapidly changing</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">You Agree To:</h3>
                <ul className="space-y-2 text-green-700 dark:text-green-300 text-sm">
                  <li>✓ Use only for planning and educational purposes</li>
                  <li>✓ Never rely on SkyMapper for flight navigation</li>
                  <li>✓ Always use certified equipment and official sources</li>
                  <li>✓ Maintain current licenses and qualifications</li>
                  <li>✓ Follow all applicable aviation regulations</li>
                  <li>✓ Make independent safety decisions</li>
                  <li>✓ Accept full responsibility for all consequences</li>
                </ul>
              </div>
            </div>

            <div className="p-6 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-3 text-center text-lg">
                MANDATORY SAFETY COMMITMENT
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-center">
                I understand that SkyMapper is for planning purposes only. I will never use it as my primary navigation
                system or rely on it for flight safety decisions. I commit to using proper certified equipment,
                consulting official sources, and maintaining the highest standards of aviation safety in all my flight operations.
              </p>
            </div>
          </div>
        </section>

        {/* Emergency Procedures */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Emergency Procedures Notice</h2>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-900/20">
              <h3 className="font-bold text-red-800 dark:text-red-200 mb-3 text-lg">
                DO NOT USE SKYMAPPER IN EMERGENCY SITUATIONS
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-4">
                In any emergency situation, follow established emergency procedures and contact appropriate authorities immediately:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Emergency Contacts:</h4>
                  <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
                    <li>• <strong>Emergency:</strong> 121.5 MHz (International Emergency)</li>
                    <li>• <strong>US Search & Rescue:</strong> Contact nearest ATC facility</li>
                    <li>• <strong>Flight Watch:</strong> 122.0 MHz</li>
                    <li>• <strong>Ground Emergency:</strong> 911 (US) or local emergency</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Emergency Actions:</h4>
                  <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
                    <li>• Squawk 7700 (Emergency)</li>
                    <li>• Communicate on emergency frequency</li>
                    <li>• Navigate using certified equipment</li>
                    <li>• Land at nearest suitable airport</li>
                    <li>• Follow emergency checklist procedures</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
              <p className="text-orange-800 dark:text-orange-200 font-medium">
                <Info className="inline mr-2" size={16} />
                <strong>Remember:</strong> Proper emergency training, current charts, certified equipment,
                and knowledge of emergency procedures are your primary tools in any emergency situation.
              </p>
            </div>
          </div>
        </section>

        {/* Final Legal Notice */}
        <section className="p-8 rounded-xl border-2 border-gray-500 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/20">
          <div className="flex items-center gap-3 mb-6">
            <Scale size={24} className="text-gray-700 dark:text-gray-300" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Legal Notice & Governing Law</h2>
          </div>

          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              This Disclaimer Policy constitutes a legally binding agreement between you and SkyMapper.
              These limitations and disclaimers are essential terms of your use of our service.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Severability:</h3>
                <p className="text-sm">
                  If any provision of this disclaimer is found to be unenforceable,
                  the remaining provisions shall remain in full force and effect.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Governing Law:</h3>
                <p className="text-sm">
                  This disclaimer shall be governed by and construed in accordance
                  with the laws of [Your Jurisdiction].
                </p>
              </div>
            </div>

            <div className="text-center mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="font-semibold">
                By continuing to use SkyMapper, you acknowledge that you have read, understood,
                and agree to be bound by all terms and limitations in this Disclaimer Policy.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
export default DisclaimerPolicy;
