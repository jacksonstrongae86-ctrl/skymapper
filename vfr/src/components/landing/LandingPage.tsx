import Image from 'next/image';
import { useState } from 'react';
import { Play, Maximize2, X, Plane, Navigation, MapPin, Route, Wind } from 'lucide-react';
// import { useTheme } from '../../utils/ThemeContext';

export default function LandingPage() {
  // const { theme } = useTheme();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMaximized, setIsVideoMaximized] = useState(false);

  const handlePlayVideo = () => {
    setIsVideoMaximized(true);
    setIsVideoPlaying(true);
  };

  const handleMaximizeVideo = () => {
    setIsVideoMaximized(true);
    if (!isVideoPlaying) {
      setIsVideoPlaying(true);
    }
  };

  const handleCloseMaximized = () => {
    setIsVideoMaximized(false);
    setIsVideoPlaying(false);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center text-white p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* --- Skymapper Blue Gradient Background --- */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"></div>
      <div className="absolute bottom-0 left-0 right-0 top-0 -z-10 bg-[radial-gradient(circle_800px_at_50%_200px,rgba(59,130,246,0.3),transparent)]"></div>

      {/* --- Animated Plane Icons --- */}
      <div className="absolute inset-0 -z-5 overflow-hidden">
        {/* Floating planes with different sizes and positions - fewer on mobile */}
        <div className="absolute top-20 left-4 sm:left-10 opacity-20 animate-pulse">
          <Plane className="w-6 h-6 sm:w-8 sm:h-8 text-white rotate-45 transform" />
        </div>
        <div className="hidden sm:block absolute top-32 right-16 opacity-15 animate-pulse" style={{ animationDelay: '1s' }}>
          <Plane className="w-6 h-6 text-blue-200 rotate-12 transform" />
        </div>
        <div className="absolute top-1/4 left-1/4 opacity-10 animate-pulse" style={{ animationDelay: '2s' }}>
          <Plane className="w-7 h-7 sm:w-10 sm:h-10 text-white rotate-90 transform" />
        </div>
        <div className="absolute top-3/4 right-1/4 opacity-20 animate-pulse" style={{ animationDelay: '3s' }}>
          <Plane className="w-5 h-5 sm:w-7 sm:h-7 text-blue-100 -rotate-45 transform" />
        </div>
        <div className="hidden sm:block absolute bottom-32 left-20 opacity-15 animate-pulse" style={{ animationDelay: '4s' }}>
          <Plane className="w-9 h-9 text-white rotate-180 transform" />
        </div>
        <div className="absolute bottom-20 right-4 sm:right-10 opacity-10 animate-pulse" style={{ animationDelay: '0.5s' }}>
          <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200 rotate-45 transform" />
        </div>

        {/* Additional planes for more density - hidden on mobile for cleaner look */}
        <div className="hidden md:block absolute top-16 left-1/2 opacity-12 animate-pulse" style={{ animationDelay: '2.5s' }}>
          <Plane className="w-7 h-7 text-blue-100 rotate-12 transform" />
        </div>
        <div className="absolute top-1/2 right-4 sm:right-8 opacity-18 animate-pulse" style={{ animationDelay: '1.5s' }}>
          <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-white rotate-135 transform" />
        </div>
        <div className="hidden sm:block absolute bottom-1/4 left-8 opacity-15 animate-pulse" style={{ animationDelay: '3.5s' }}>
          <Plane className="w-8 h-8 text-blue-200 rotate-270 transform" />
        </div>
        <div className="hidden md:block absolute top-3/4 left-1/2 opacity-10 animate-pulse" style={{ animationDelay: '4.5s' }}>
          <Plane className="w-5 h-5 text-white rotate-30 transform" />
        </div>

        {/* Navigation and map icons - simplified for mobile */}
        <div className="hidden sm:block absolute top-40 right-1/4 opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>
          <Navigation className="w-6 h-6 text-blue-100 rotate-45 transform" />
        </div>
        <div className="absolute bottom-40 left-1/6 sm:left-1/4 opacity-15 animate-pulse" style={{ animationDelay: '3s' }}>
          <MapPin className="w-5 h-5 sm:w-7 sm:h-7 text-white transform" />
        </div>
        <div className="hidden md:block absolute top-2/3 left-16 opacity-18 animate-pulse" style={{ animationDelay: '2s' }}>
          <Route className="w-6 h-6 text-blue-200 rotate-90 transform" />
        </div>
        <div className="hidden sm:block absolute bottom-1/3 right-20 opacity-12 animate-pulse" style={{ animationDelay: '4s' }}>
          <Wind className="w-8 h-8 text-blue-100 rotate-45 transform" />
        </div>
        <div className="hidden md:block absolute top-1/3 right-12 opacity-15 animate-pulse" style={{ animationDelay: '0.8s' }}>
          <Navigation className="w-5 h-5 text-white rotate-180 transform" />
        </div>

        {/* Flight path dots pattern - simplified for mobile */}
        <div className="absolute top-1/3 left-1/4 sm:left-1/3 opacity-30">
          <div className="flex space-x-1 sm:space-x-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-200 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="hidden sm:block w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            <div className="hidden sm:block w-2 h-2 bg-blue-200 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>

        <div className="absolute top-2/3 right-1/4 sm:right-1/3 opacity-25 rotate-45">
          <div className="flex space-x-1 sm:space-x-2">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-100 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-ping" style={{ animationDelay: '2.5s' }}></div>
            <div className="hidden sm:block w-1.5 h-1.5 bg-blue-100 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
          </div>
        </div>

        {/* Additional flight path patterns - simplified for mobile */}
        <div className="hidden sm:block absolute top-1/5 right-1/5 opacity-20 -rotate-12">
          <div className="flex space-x-1.5">
            <div className="w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            <div className="w-1 h-1 bg-blue-200 rounded-full animate-ping" style={{ animationDelay: '1.3s' }}></div>
            <div className="w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1.6s' }}></div>
            <div className="hidden md:block w-1 h-1 bg-blue-200 rounded-full animate-ping" style={{ animationDelay: '1.9s' }}></div>
            <div className="hidden md:block w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '2.2s' }}></div>
          </div>
        </div>

        <div className="absolute bottom-1/5 left-1/6 sm:left-1/5 opacity-25 rotate-75">
          <div className="flex space-x-1 sm:space-x-1.5">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-100 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-ping" style={{ animationDelay: '3.4s' }}></div>
            <div className="hidden sm:block w-1.5 h-1.5 bg-blue-100 rounded-full animate-ping" style={{ animationDelay: '3.8s' }}></div>
          </div>
        </div>

        <div className="hidden md:block absolute top-1/2 left-1/5 opacity-15 -rotate-30">
          <div className="flex flex-col space-y-1.5">
            <div className="w-1 h-1 bg-blue-200 rounded-full animate-ping" style={{ animationDelay: '4s' }}></div>
            <div className="w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '4.3s' }}></div>
            <div className="w-1 h-1 bg-blue-200 rounded-full animate-ping" style={{ animationDelay: '4.6s' }}></div>
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

        {/* Compass rose in corner - smaller on mobile */}
        <div className="absolute top-4 sm:top-8 right-4 sm:right-8 opacity-15">
          <div className="relative w-10 h-10 sm:w-16 sm:h-16">
            <div className="absolute inset-0 border border-white sm:border-2 rounded-full"></div>
            <div className="absolute top-0.5 sm:top-1 left-1/2 w-0.5 h-3 sm:h-6 bg-white transform -translate-x-0.5"></div>
            <div className="absolute bottom-0.5 sm:bottom-1 left-1/2 w-0.5 h-3 sm:h-6 bg-white transform -translate-x-0.5"></div>
            <div className="absolute left-0.5 sm:left-1 top-1/2 w-3 sm:w-6 h-0.5 bg-white transform -translate-y-0.5"></div>
            <div className="absolute right-0.5 sm:right-1 top-1/2 w-3 sm:w-6 h-0.5 bg-white transform -translate-y-0.5"></div>
            <div className="absolute top-0 left-1/2 text-xs text-white transform -translate-x-1/2 -translate-y-3 sm:-translate-y-4">N</div>
          </div>
        </div>

        {/* Additional compass in bottom left - hidden on mobile */}
        <div className="hidden sm:block absolute bottom-8 left-8 opacity-10">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border border-blue-200 rounded-full"></div>
            <div className="absolute top-0.5 left-1/2 w-0.5 h-4 bg-blue-200 transform -translate-x-0.5"></div>
            <div className="absolute bottom-0.5 left-1/2 w-0.5 h-4 bg-blue-200 transform -translate-x-0.5"></div>
            <div className="absolute left-0.5 top-1/2 w-4 h-0.5 bg-blue-200 transform -translate-y-0.5"></div>
            <div className="absolute right-0.5 top-1/2 w-4 h-0.5 bg-blue-200 transform -translate-y-0.5"></div>
          </div>
        </div>

        {/* Aviation altitude markers - hidden on mobile */}
        <div className="hidden sm:block absolute top-1/4 right-1/6 opacity-15 animate-pulse" style={{ animationDelay: '2.8s' }}>
          <div className="text-xs text-blue-100 font-mono">FL350</div>
        </div>
        <div className="hidden sm:block absolute bottom-1/4 left-1/6 opacity-12 animate-pulse" style={{ animationDelay: '4.2s' }}>
          <div className="text-xs text-white font-mono">3000&apos;</div>
        </div>
        <div className="hidden md:block absolute top-1/2 right-1/5 opacity-10 animate-pulse" style={{ animationDelay: '1.8s' }}>
          <div className="text-xs text-blue-200 font-mono">FL180</div>
        </div>

        {/* Runway patterns - hidden on mobile */}
        <div className="hidden sm:block absolute top-20 left-1/3 opacity-8">
          <div className="w-12 h-1 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-blue-200 rounded-full mt-1 ml-5"></div>
        </div>
        <div className="hidden md:block absolute bottom-20 right-1/3 opacity-8 rotate-45">
          <div className="w-8 h-0.5 bg-blue-100 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-white rounded-full mt-0.5 ml-3"></div>
        </div>

        {/* Wind direction indicators - hidden on mobile */}
        <div className="hidden md:block absolute top-1/3 left-1/6 opacity-12">
          <div className="flex items-center space-x-1">
            <div className="w-6 h-0.5 bg-blue-100"></div>
            <div className="w-0 h-0 border-l-2 border-l-blue-100 border-y-1 border-y-transparent"></div>
          </div>
          <div className="text-xs text-blue-100 font-mono mt-1">270/15</div>
        </div>

        <div className="hidden md:block absolute bottom-1/3 right-1/6 opacity-10 rotate-90">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-0.5 bg-white"></div>
            <div className="w-0 h-0 border-l-1.5 border-l-white border-y-0.5 border-y-transparent"></div>
          </div>
        </div>

        {/* Radio frequency indicators - hidden on mobile */}
        <div className="hidden md:block absolute top-40 left-1/5 opacity-8 animate-pulse" style={{ animationDelay: '3.5s' }}>
          <div className="text-xs text-blue-200 font-mono">118.75</div>
        </div>
        <div className="hidden md:block absolute bottom-40 right-1/5 opacity-10 animate-pulse" style={{ animationDelay: '1.2s' }}>
          <div className="text-xs text-white font-mono">121.50</div>
        </div>

        {/* Constellation patterns - hidden on mobile */}
        <div className="hidden lg:block absolute top-12 left-1/4 opacity-8">
          <div className="relative">
            <div className="w-1 h-1 bg-white rounded-full absolute"></div>
            <div className="w-1 h-1 bg-white rounded-full absolute top-3 left-4"></div>
            <div className="w-1 h-1 bg-white rounded-full absolute top-6 left-2"></div>
            <div className="w-0.5 h-6 bg-white/30 absolute top-0 left-0 rotate-45 origin-top"></div>
            <div className="w-0.5 h-4 bg-white/30 absolute top-3 left-4 rotate-135 origin-top"></div>
          </div>
        </div>

        <div className="hidden lg:block absolute bottom-12 right-1/4 opacity-6">
          <div className="relative">
            <div className="w-0.5 h-0.5 bg-blue-100 rounded-full absolute"></div>
            <div className="w-0.5 h-0.5 bg-blue-100 rounded-full absolute top-2 left-3"></div>
            <div className="w-0.5 h-0.5 bg-blue-100 rounded-full absolute top-4 left-1"></div>
            <div className="w-0.5 h-0.5 bg-blue-100 rounded-full absolute top-1 left-5"></div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex w-full max-w-5xl flex-col items-center text-center px-2 sm:px-4">
        {/* --- LOGO AND BRANDING --- */}
        <div className="mb-6 sm:mb-8 flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Skymapper Logo"
            width={80}
            height={80}
            className="mb-3 sm:mb-4 w-20 h-20 sm:w-24 sm:h-24"
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white px-2">
            Plan your VFR routes in seconds
          </h1>
          <p className="mt-2 sm:mt-3 text-base sm:text-lg md:text-xl font-light text-slate-300 px-4">
            Learn how to do it in this short video
          </p>
        </div>

        {/* --- VIDEO CONTAINER --- */}
        <div className="relative mb-8 sm:mb-10 w-full max-w-4xl group px-2 sm:px-0">
          <div className="relative w-full rounded-lg overflow-hidden bg-slate-800 border border-blue-400/30 shadow-2xl" style={{ aspectRatio: '16/14' }}>
            <video
              id="tutorial-video"
              className="w-full h-full object-cover cursor-pointer"
              src="/videos/tutorial.mp4"
              preload="metadata"
              onClick={handleMaximizeVideo}
            />
            {!isVideoMaximized && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={handlePlayVideo}
                  className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-blue-600 hover:bg-blue-500 transition-all duration-300 hover:scale-110 shadow-lg ring-2 sm:ring-4 ring-blue-400/30"
                >
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white ml-0.5 sm:ml-1" fill="currentColor" />
                </button>
              </div>
            )}
            {/* Maximize button */}
            <button
              onClick={handleMaximizeVideo}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 p-1.5 sm:p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all duration-200 opacity-0 hover:opacity-100 group-hover:opacity-100"
            >
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
        </div>

        {/* --- CALL TO ACTION BUTTON --- */}
        <button
          onClick={() => {
            // Mark that user has seen the landing page
            localStorage.setItem('skymapper-has-visited', 'true');
            // Navigate to the app by reloading the page
            window.location.reload();
          }}
          className="mb-8 sm:mb-10 bg-gradient-to-r from-white to-blue-50 text-blue-700 px-8 py-4 sm:px-12 sm:py-5 md:px-16 md:py-6 text-lg sm:text-xl md:text-2xl font-bold rounded-full shadow-2xl transition-all duration-300 ease-in-out hover:scale-105 sm:hover:scale-110 hover:shadow-3xl border-2 border-white/20 hover:border-white/40 relative overflow-hidden group mx-4"
        >
          <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
            <span className="text-center leading-tight">Start Planning Your Flight</span>
            <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-auto pt-6 sm:pt-8 text-xs sm:text-sm text-blue-200 text-center px-4">
        &copy; {new Date().getFullYear()} Skymapper. All rights reserved.
      </footer>

      {/* --- MAXIMIZED VIDEO MODAL --- */}
      {isVideoMaximized && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full max-w-6xl aspect-video">
            <video
              className="w-full h-full object-contain rounded-lg"
              src="/videos/tutorial.mp4"
              controls
              autoPlay={isVideoPlaying}
              onEnded={() => setIsVideoPlaying(false)}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
            />
            <button
              onClick={handleCloseMaximized}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/70 transition-all duration-200"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
