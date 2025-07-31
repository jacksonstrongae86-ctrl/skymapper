import React from "react";
import { Loader2 } from "lucide-react";
// Use your Logo SVG/React component for best quality. If unavailable, fallback to <img src=...>.

// If your Logo is an image file:
import Image from "next/image";
import logoUrl from "../../public/logo.png";

// Or, if using a React component:
// import Logo from "@/src/components/Logo";

const LoadingPage: React.FC = () => {

  return (
    <div
      className={`
        fixed inset-0 z-50 flex flex-col items-center justify-center
        bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-900
        transition-colors
      `}
    >
      {/* Card with shadow and round */}
      <div
        className={`
          flex flex-col items-center justify-center p-10 rounded-2xl shadow-2xl
          ${`button-gradient-dark`}
          border border-[var(--sidebar-border)]
          backdrop-blur-md
          bg-opacity-90
        `}
        style={{ minWidth: 280, maxWidth: 360 }}
      >
        {/* Logo */}
        <div className="mb-5 bg-white rounded-lg">
          {/* For img: */}
          <Image src={logoUrl} alt="Logo" width={80} height={80} priority className="rounded-xl shadow-lg   " />
          {/* Or, for React Logo: <Logo width={80} height={80} /> */}
        </div>

        {/* Animated Loader */}
        <Loader2
          size={40}
          className="animate-spin text-white opacity-90 mb-5 drop-shadow-xl"
        />

        {/* Loading Text */}
        <div className="text-xl font-semibold tracking-wide text-white drop-shadow mb-1 animate-fadeIn">
          Loading...
        </div>
        <div className="text-sm font-medium opacity-70 tracking-wider animate-fadeIn">
          Preparing your sky journey<span className="animate-bounce inline-block ml-1">✈️</span>
        </div>
      </div>

      {/* Optional soft overlay to match your app’s feeling */}
      <div className="absolute inset-0 pointer-events-none" style={{ background:
        "radial-gradient(circle at 70% 30%,rgba(255,255,255,0.12),transparent 70%)"
      }} />

    </div>
  );
};

export default LoadingPage;
