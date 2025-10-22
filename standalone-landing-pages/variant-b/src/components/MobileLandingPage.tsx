import Image from 'next/image';
import { Plane, MapPin } from 'lucide-react';

export default function MobileLandingPage() {
  // Get redirect URL from environment variable, fallback to current domain
  const skymapperUrl = process.env.NEXT_PUBLIC_SKYMAPPER_URL || (typeof window !== 'undefined' ? window.location.origin : '');

  const handleStartPlanning = () => {
    // Track conversion if analytics is set up
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        variant: process.env.NEXT_PUBLIC_VARIANT || 'A',
        timestamp: new Date().toISOString(),
      });
    }

    // Redirect to main Skymapper app
    window.location.href = skymapperUrl;
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center text-white p-4 overflow-hidden">
      {/* --- Skymapper Blue Gradient Background --- */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"></div>
      <div className="absolute bottom-0 left-0 right-0 top-0 -z-10 bg-[radial-gradient(circle_800px_at_50%_200px,rgba(59,130,246,0.3),transparent)]"></div>

      {/* --- Animated Plane Icons (Mobile Optimized) --- */}
      <div className="absolute inset-0 -z-5 overflow-hidden">
        {/* Fewer animated elements for mobile performance */}
        <div className="absolute top-20 left-4 opacity-20 animate-pulse">
          <Plane className="w-6 h-6 text-white rotate-45 transform" />
        </div>
        <div className="absolute top-1/4 left-1/4 opacity-10 animate-pulse" style={{ animationDelay: '2s' }}>
          <Plane className="w-7 h-7 text-white rotate-90 transform" />
        </div>
        <div className="absolute top-3/4 right-1/4 opacity-20 animate-pulse" style={{ animationDelay: '3s' }}>
          <Plane className="w-5 h-5 text-blue-100 -rotate-45 transform" />
        </div>
        <div className="absolute bottom-20 right-4 opacity-10 animate-pulse" style={{ animationDelay: '0.5s' }}>
          <Plane className="w-4 h-4 text-blue-200 rotate-45 transform" />
        </div>
        <div className="absolute top-1/2 right-4 opacity-18 animate-pulse" style={{ animationDelay: '1.5s' }}>
          <Plane className="w-5 h-5 text-white rotate-135 transform" />
        </div>

        {/* Navigation and map icons */}
        <div className="absolute bottom-40 left-1/6 opacity-15 animate-pulse" style={{ animationDelay: '3s' }}>
          <MapPin className="w-5 h-5 text-white transform" />
        </div>

        {/* Flight path dots pattern */}
        <div className="absolute top-1/3 left-1/4 opacity-30">
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
            <div className="w-1.5 h-1.5 bg-blue-200 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>

        <div className="absolute top-2/3 right-1/4 opacity-25 rotate-45">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-blue-100 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
            <div className="w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '2.5s' }}></div>
          </div>
        </div>

        <div className="absolute bottom-1/5 left-1/6 opacity-25 rotate-75">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-blue-100 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
            <div className="w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '3.4s' }}></div>
          </div>
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5"
             style={{
               backgroundImage: `
                 linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
               `,
               backgroundSize: '50px 50px'
             }}>
        </div>

        {/* Compass rose in corner */}
        <div className="absolute top-4 right-4 opacity-15">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border border-white rounded-full"></div>
            <div className="absolute top-0.5 left-1/2 w-0.5 h-3 bg-white transform -translate-x-0.5"></div>
            <div className="absolute bottom-0.5 left-1/2 w-0.5 h-3 bg-white transform -translate-x-0.5"></div>
            <div className="absolute left-0.5 top-1/2 w-3 h-0.5 bg-white transform -translate-y-0.5"></div>
            <div className="absolute right-0.5 top-1/2 w-3 h-0.5 bg-white transform -translate-y-0.5"></div>
            <div className="absolute top-0 left-1/2 text-xs text-white transform -translate-x-1/2 -translate-y-3">N</div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex w-full max-w-lg flex-col items-center text-center px-4">
        {/* --- LOGO AND BRANDING --- */}
        <div className="mb-6 flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Skymapper Logo"
            width={80}
            height={80}
            className="mb-3 w-20 h-20"
          />
          <h1 className="text-2xl font-bold tracking-tight text-white px-2">
            Your flight plan, simplified
          </h1>
          <p className="mt-2 text-base font-light text-slate-300 px-4">
            Watch this quick tutorial and start planning
          </p>
        </div>

        {/* --- VIDEO CONTAINER --- */}
        <div className="relative mb-10 w-full max-w-xs mx-auto">
          <div className="relative w-full rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border border-blue-400/20">
            <video
              id="tutorial-video"
              className="w-full h-full object-cover"
              src="/videos/tutorial.mp4"
              autoPlay
              muted
              loop
              playsInline
              style={{ aspectRatio: '9/16' }}
            />
          </div>
        </div>

        {/* --- CALL TO ACTION BUTTON --- */}
        <button
          onClick={handleStartPlanning}
          className="mb-8 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 text-lg font-bold rounded-full shadow-2xl transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 hover:shadow-3xl border-2 border-emerald-400/40 hover:border-emerald-300/60 active:border-emerald-300/80 relative overflow-hidden group w-full max-w-sm"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="text-center leading-tight">Get Started Now</span>
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-auto pt-6 text-xs text-blue-200 text-center px-4">
        &copy; {new Date().getFullYear()} Skymapper. All rights reserved.
      </footer>
    </main>
  );
}
