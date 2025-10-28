import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Lightbulb } from 'lucide-react';
import { getRandomTrivia, TriviaItem } from '@/src/utils/triviaData';
import { useTheme } from '@/src/utils/ThemeContext';

interface TriviaPopupProps {
  onClose: () => void;
  autoRotate?: boolean;
  rotateInterval?: number; // milliseconds
}

const TriviaPopup: React.FC<TriviaPopupProps> = ({
  onClose,
  autoRotate = true,
  rotateInterval = 15000 // 15 seconds
}) => {
  const { theme } = useTheme();
  const [currentTrivia, setCurrentTrivia] = useState<TriviaItem>(getRandomTrivia());
  const [isVisible, setIsVisible] = useState(false);

  // Animation entrance effect
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate trivia
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setCurrentTrivia(getRandomTrivia());
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval]);

  const handleNewTrivia = () => {
    setCurrentTrivia(getRandomTrivia());
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const ButtonClass = `
    p-2 rounded-lg
    ${`button-gradient-${theme}`}
    text-[var(--button-text)]
    hover:opacity-90
    transition-all duration-200
    flex items-center justify-center
    shadow-md
  `;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`
          fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]
          transition-opacity duration-300
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleClose}
      />

      {/* Popup */}
      <div className={`
        fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]
        max-w-lg w-[90vw] sm:w-auto
        transition-all duration-300
        ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}>
        <div className={`
          ${`gradient-${theme}`}
          backdrop-blur-md
          rounded-xl shadow-2xl
          border border-[var(--sidebar-border)]
          p-6
          relative
          ring-4 ring-white/10
        `}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`
                ${`button-gradient-${theme}`}
                p-2.5 rounded-xl
                shadow-lg
              `}>
                <Lightbulb className="w-5 h-5 text-[var(--button-text)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--sidebar-text)]">
                  Did you know?
                </h3>
                <span className={`
                  px-2 py-0.5 text-xs font-semibold rounded-full capitalize
                  ${`button-gradient-${theme}`}
                  text-[var(--button-text)]
                `}>
                  {currentTrivia.category}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleNewTrivia}
                className={ButtonClass}
                title="New trivia"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className={ButtonClass}
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex items-start gap-4">
            <span className="text-3xl flex-shrink-0">
              {currentTrivia.icon}
            </span>
            <p className="text-base text-[var(--sidebar-text)] leading-relaxed font-medium">
              {currentTrivia.text}
            </p>
          </div>

          {/* Auto-rotate progress bar */}
          {autoRotate && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--sidebar-border)] overflow-hidden rounded-b-xl">
              <div
                className={`h-full ${`button-gradient-${theme}`} animate-progress-bar`}
                style={{
                  animation: `progress-bar ${rotateInterval}ms linear infinite`
                }}
              />
            </div>
          )}
        </div>

        {/* Add keyframes for progress bar */}
        <style jsx>{`
          @keyframes progress-bar {
            from { width: 0%; }
            to { width: 100%; }
          }
          .animate-progress-bar {
            animation: progress-bar ${rotateInterval}ms linear infinite;
          }
        `}</style>
      </div>
    </>
  );
};

export default TriviaPopup;