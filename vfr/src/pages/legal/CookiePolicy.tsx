// src/pages/legal/CookiePolicy.tsx
import React, { useState } from "react";
import { useTheme } from "@/src/utils/ThemeContext";
import { CookieUtils } from "../../utils/cookieUtils";
import {
  Cookie,
  Shield,
  BarChart,
  Target,
  Settings,
  Clock,
  Globe,
  Eye,
  Trash2,
  Download,
  RefreshCw,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Database,
//   Lock
} from "lucide-react";

export const CookiePolicy: React.FC = () => {
  const { theme } = useTheme();
  const [currentCookies, setCurrentCookies] = useState<Record<string, string>>({});
  const [showCookieDebug, setShowCookieDebug] = useState(false);

  const refreshCookies = () => {
    setCurrentCookies(CookieUtils.getAllCookies());
  };

  const clearAllCookies = () => {
    if (confirm("Are you sure you want to clear all SkyMapper cookies? This will reset your preferences.")) {
      CookieUtils.clearSkyMapperCookies();
      refreshCookies();
      alert("SkyMapper cookies have been cleared.");
    }
  };

  const downloadCookieData = () => {
    const skyMapperCookies = CookieUtils.getSkyMapperCookies();
    const data = JSON.stringify(skyMapperCookies, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skymapper-cookies.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  React.useEffect(() => {
    refreshCookies();
  }, []);

  const cookieCategories = [
    {
      type: "necessary",
      title: "Necessary Cookies",
      description: "Essential cookies required for basic functionality and security",
      icon: Shield,
      color: "green",
      examples: [
        { name: "skymapper_session", purpose: "User authentication and session management", expires: "Session" },
        { name: "skymapper_csrf", purpose: "Cross-site request forgery protection", expires: "Session" },
        { name: "skymapper_security", purpose: "Security token for API requests", expires: "24 hours" },
        { name: "skymapper_necessary_consent", purpose: "Record of necessary cookie acceptance", expires: "1 year" },
      ],
      canDisable: false,
    },
    {
      type: "analytics",
      title: "Analytics Cookies",
      description: "Help us understand usage patterns and improve the application",
      icon: BarChart,
      color: "blue",
      examples: [
        { name: "_ga", purpose: "Google Analytics - distinguishes users", expires: "2 years" },
        { name: "_gid", purpose: "Google Analytics - distinguishes users", expires: "24 hours" },
        { name: "skymapper_analytics_consent", purpose: "Record of analytics consent", expires: "1 year" },
        { name: "skymapper_usage_stats", purpose: "Anonymous usage statistics", expires: "30 days" },
      ],
      canDisable: true,
    },
    {
      type: "marketing",
      title: "Marketing Cookies",
      description: "Used for personalized content and advertising",
      icon: Target,
      color: "purple",
      examples: [
        { name: "skymapper_marketing_consent", purpose: "Record of marketing consent", expires: "1 year" },
        { name: "skymapper_user_segment", purpose: "User categorization for content", expires: "90 days" },
        { name: "_fbp", purpose: "Facebook Pixel (if enabled)", expires: "90 days" },
        { name: "skymapper_recommendations", purpose: "Personalized feature recommendations", expires: "30 days" },
      ],
      canDisable: true,
    },
    {
      type: "preferences",
      title: "Preference Cookies",
      description: "Remember your settings and customize your experience",
      icon: Settings,
      color: "orange",
      examples: [
        { name: "skymapper_theme", purpose: "Remember your theme preference", expires: "1 year" },
        { name: "skymapper_units", purpose: "Remember measurement unit preferences", expires: "1 year" },
        { name: "skymapper_language", purpose: "Language selection", expires: "1 year" },
        { name: "skymapper_dashboard_layout", purpose: "Custom dashboard configuration", expires: "6 months" },
      ],
      canDisable: true,
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { border: string; bg: string; text: string }> = {
      green: {
        border: "border-green-300 dark:border-green-700",
        bg: "bg-green-50 dark:bg-green-900/20",
        text: "text-green-800 dark:text-green-200",
      },
      blue: {
        border: "border-blue-300 dark:border-blue-700",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        text: "text-blue-800 dark:text-blue-200",
      },
      purple: {
        border: "border-purple-300 dark:border-purple-700",
        bg: "bg-purple-50 dark:bg-purple-900/20",
        text: "text-purple-800 dark:text-purple-200",
      },
      orange: {
        border: "border-orange-300 dark:border-orange-700",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        text: "text-orange-800 dark:text-orange-200",
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className={`min-h-screen ${`gradient-${theme}`} py-8`}>
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <Cookie size={40} className="text-[var(--button-text)]" />
            <div>
              <h1 className="text-4xl font-bold text-[var(--sidebar-text)]">
                Cookie Policy
              </h1>
              <p className="text-[var(--sidebar-text)] opacity-75 mt-2">
                How SkyMapper uses cookies and similar technologies
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
              Applies to all users
            </span>
            <span className="flex items-center gap-1">
              <Shield size={14} />
              GDPR & ePrivacy compliant
            </span>
          </div>
        </div>

        {/* Aviation Safety Notice */}
        <div className="mb-10 p-6 rounded-xl border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-800 dark:text-red-200 mb-2">
                Aviation Safety Reminder
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm">
                SkyMapper cookies are used to enhance your flight planning experience, but remember:
                this is a planning tool only. Always verify all information with official aviation
                sources and use certified equipment for actual flight operations.
              </p>
            </div>
          </div>
        </div>

        {/* Cookie Management Dashboard */}
        <div className="mb-10 p-6 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Database size={24} className="text-[var(--button-text)]" />
              <div>
                <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">
                  Your Cookie Dashboard
                </h2>
                <p className="text-sm text-[var(--sidebar-text)] opacity-75">
                  Manage and view your current cookie settings
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={refreshCookies}
                className={`px-4 py-2 rounded-lg border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] hover:opacity-80 transition-all duration-200 flex items-center gap-2`}
              >
                <RefreshCw size={16} />
                Refresh
              </button>

              <button
                onClick={downloadCookieData}
                className={`px-4 py-2 rounded-lg border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] hover:opacity-80 transition-all duration-200 flex items-center gap-2`}
              >
                <Download size={16} />
                Export
              </button>

              <button
                onClick={clearAllCookies}
                className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:opacity-80 transition-all duration-200 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>
          </div>

          {/* Current Cookie Status */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {cookieCategories.map((category) => {
              const Icon = category.icon;
              const colors = getColorClasses(category.color);
              const isEnabled = CookieUtils.getConsentStatus(category.type as 'necessary' | 'analytics' | 'marketing' | 'preferences') ?? (category.type === 'necessary');
              return (
                <div key={category.type} className={`p-4 rounded-lg border ${colors.border} ${colors.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={18} className={colors.text.replace('text-', 'text-').replace(' dark:', ' dark:')} />
                    <span className={`font-medium ${colors.text} text-sm`}>
                      {category.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEnabled ? (
                      <>
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                        <span className="text-xs text-green-700 dark:text-green-300">Enabled</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} className="text-red-600 dark:text-red-400" />
                        <span className="text-xs text-red-700 dark:text-red-300">Disabled</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cookie Debug Info */}
          <div className="border-t border-[var(--sidebar-border)] pt-4">
            <button
              onClick={() => setShowCookieDebug(!showCookieDebug)}
              className="flex items-center gap-2 text-sm text-[var(--button-bg)] hover:opacity-75 transition-opacity"
            >
              <Info size={16} />
              {showCookieDebug ? 'Hide' : 'Show'} Technical Details
            </button>

            {showCookieDebug && (
              <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-mono">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Browser Info:</h4>
                    <p>Cookies Enabled: {CookieUtils.areCookiesEnabled() ? 'Yes' : 'No'}</p>
                    <p>Total Cookie Size: {CookieUtils.getTotalCookieSize()} bytes</p>
                    <p>Near Limit: {CookieUtils.isNearCookieLimit() ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Current Cookies:</h4>
                    <p>Total: {Object.keys(currentCookies).length}</p>
                    <p>SkyMapper: {Object.keys(CookieUtils.getSkyMapperCookies()).length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* What Are Cookies */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Info size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">What Are Cookies?</h2>
          </div>

          <div className="space-y-6">
            <p className="text-[var(--sidebar-text)]">
              Cookies are small text files that are stored on your device when you visit SkyMapper. They help us provide
              you with a better experience by remembering your preferences, analyzing how you use our service, and ensuring
              the security of your interactions with our application.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                  <Globe size={18} />
                  First-Party Cookies
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Set directly by SkyMapper to provide core functionality, remember your preferences,
                  and maintain your session security.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20">
                <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                  <Target size={18} />
                  Third-Party Cookies
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Set by our trusted partners for analytics (Google Analytics), weather data providers,
                  and mapping services, always under strict privacy agreements.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                  <Clock size={18} />
                  Session vs Persistent
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Session cookies are deleted when you close your browser, while persistent cookies
                  remain for a specified period to remember your preferences.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cookie Categories */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <Cookie size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Types of Cookies We Use</h2>
          </div>

          <div className="space-y-8">
            {cookieCategories.map((category) => {
              const Icon = category.icon;
              const colors = getColorClasses(category.color);

              return (
                <div key={category.type} className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Icon size={24} className={colors.text.replace('text-', 'text-').replace(' dark:', ' dark:')} />
                        <div>
                          <h3 className={`text-xl font-semibold ${colors.text}`}>
                            {category.title}
                          </h3>
                          <p className={`text-sm ${colors.text} opacity-80`}>
                            {category.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!category.canDisable && (
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full border border-green-300 dark:border-green-700">
                            Required
                          </span>
                        )}
                        {CookieUtils.getConsentStatus(category.type as 'necessary' | 'analytics' | 'marketing' | 'preferences') ?? (category.type === 'necessary') ? (
                          <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle size={20} className="text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    </div>

                    {/* Cookie Examples */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className={`${colors.text} opacity-75`}>
                            <th className="text-left py-2 px-3 font-medium">Cookie Name</th>
                            <th className="text-left py-2 px-3 font-medium">Purpose</th>
                            <th className="text-left py-2 px-3 font-medium">Expires</th>
                          </tr>
                        </thead>
                        <tbody>
                          {category.examples.map((example, index) => (
                            <tr key={index} className="border-t border-opacity-30 border-gray-300 dark:border-gray-600">
                              <td className={`py-2 px-3 font-mono text-xs ${colors.text}`}>{example.name}</td>
                              <td className={`py-2 px-3 ${colors.text} opacity-80`}>{example.purpose}</td>
                              <td className={`py-2 px-3 ${colors.text} opacity-60`}>{example.expires}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Managing Cookies */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Settings size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Managing Your Cookie Preferences</h2>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-50">
                <h3 className="font-semibold text-[var(--sidebar-text)] mb-4 flex items-center gap-2">
                  <Eye size={18} />
                  SkyMapper Cookie Settings
                </h3>
                <ul className="space-y-2 text-[var(--sidebar-text)] text-sm">
                  <li>• Use our consent manager to customize preferences</li>
                  <li>• Change settings anytime from the privacy center</li>
                  <li>• Export your current cookie data</li>
                  <li>• Clear specific categories or all cookies</li>
                  <li>• View detailed information about each cookie</li>
                </ul>
              </div>

              <div className="p-6 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-50">
                <h3 className="font-semibold text-[var(--sidebar-text)] mb-4 flex items-center gap-2">
                  <Globe size={18} />
                  Browser Cookie Controls
                </h3>
                <ul className="space-y-2 text-[var(--sidebar-text)] text-sm">
                  <li>• Disable cookies entirely in browser settings</li>
                  <li>• Block third-party cookies only</li>
                  <li>• Clear cookies when browser closes</li>
                  <li>• Set cookie expiration preferences</li>
                  <li>• Use incognito/private browsing mode</li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20">
              <div className="flex items-start gap-2">
                <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Important Note About Disabling Cookies
                  </h4>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    Disabling certain cookies may limit SkyMappers functionality. Necessary cookies cannot be disabled
                    as they are essential for security and basic operations. If you disable all cookies, some features
                    like user preferences, saved flight plans, and personalized settings will not work properly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Browser Instructions */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Globe size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Browser-Specific Instructions</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { browser: "Chrome", steps: ["Settings → Privacy and Security → Cookies", "Choose your preferred settings", "Manage site-specific permissions"] },
              { browser: "Firefox", steps: ["Settings → Privacy & Security", "Enhanced Tracking Protection", "Manage cookie exceptions"] },
              { browser: "Safari", steps: ["Preferences → Privacy", "Manage Website Data", "Block or allow cookies"] },
              { browser: "Edge", steps: ["Settings → Cookies and Permissions", "Manage cookie behavior", "Site permissions"] },
              { browser: "Opera", steps: ["Settings → Advanced → Privacy", "Cookie settings", "Site data management"] },
              { browser: "Mobile", steps: ["Browser settings → Privacy", "Cookie preferences", "Site-specific controls"] },
            ].map((item, index) => (
              <div key={index} className="p-4 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-30">
                <h3 className="font-semibold text-[var(--sidebar-text)] mb-3">{item.browser}</h3>
                <ol className="text-sm text-[var(--sidebar-text)] space-y-1 list-decimal pl-4">
                  {item.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="opacity-80">{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-10 p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <Clock size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Cookie Retention Periods</h2>
          </div>

          <div className="space-y-4 text-[var(--sidebar-text)]">
            <p>
              Different types of cookies have different retention periods based on their purpose and legal requirements:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-[var(--sidebar-border)] rounded-lg">
                <thead className="bg-[var(--sidebar-bg)] bg-opacity-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Cookie Type</th>
                    <th className="text-left py-3 px-4 font-medium">Retention Period</th>
                    <th className="text-left py-3 px-4 font-medium">Can Be Cleared</th>
                    <th className="text-left py-3 px-4 font-medium">Auto-Renewal</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: "Session Cookies", retention: "Until browser closes", clearable: "Yes", renewal: "Each session" },
                    { type: "Authentication", retention: "24 hours to 30 days", clearable: "Yes (logs you out)", renewal: "On login" },
                    { type: "Preferences", retention: "1 year", clearable: "Yes", renewal: "On update" },
                    { type: "Analytics", retention: "2 years (Google Analytics)", clearable: "Yes", renewal: "Per visit" },
                    { type: "Consent Records", retention: "1 year", clearable: "Yes (resets consent)", renewal: "On change" },
                  ].map((row, index) => (
                    <tr key={index} className="border-t border-[var(--sidebar-border)]">
                      <td className="py-3 px-4 font-medium">{row.type}</td>
                      <td className="py-3 px-4">{row.retention}</td>
                      <td className="py-3 px-4">{row.clearable}</td>
                      <td className="py-3 px-4">{row.renewal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Updates to Policy */}
        <section className="p-8 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3 mb-6">
            <RefreshCw size={24} className="text-[var(--button-text)]" />
            <h2 className="text-2xl font-semibold text-[var(--sidebar-text)]">Changes to This Cookie Policy</h2>
          </div>

          <div className="space-y-4 text-[var(--sidebar-text)]">
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology, law, or our business practices.
              When we make material changes, we will notify you through:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-30">
                <h3 className="font-semibold mb-3">How We Notify You:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Updated consent banner on next visit</li>
                  <li>• Email notifications for significant changes</li>
                  <li>• In-app notifications in your privacy center</li>
                  <li>• Prominent notices on our website</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border border-[var(--sidebar-border)] bg-white dark:bg-gray-800 bg-opacity-30">
                <h3 className="font-semibold mb-3">Your Options:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Review and update your preferences</li>
                  <li>• Withdraw consent for non-essential cookies</li>
                  <li>• Contact us with questions or concerns</li>
                  <li>• Stop using SkyMapper if you disagree</li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-6 pt-4 border-t border-[var(--sidebar-border)]">
              <p className="text-sm opacity-75">
                Your continued use of SkyMapper after policy changes indicates acceptance of the updated terms.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CookiePolicy;

