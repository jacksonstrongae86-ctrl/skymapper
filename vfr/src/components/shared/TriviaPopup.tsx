import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { getRandomTrivia, getCategoryColor, TriviaItem } from '@/src/utils/triviaData';

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

  const gradientClass = getCategoryColor(currentTrivia.category);

  return (
    <div className={`
      fixed bottom-4 right-4 z-[90]
      max-w-xs sm:max-w-sm
      transform transition-all duration-300
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
    `}>
      <div className={`
        bg-gradient-to-r ${gradientClass}
        rounded-xl shadow-lg border border-white/20
        p-4 text-white
        backdrop-blur-sm
        relative overflow-hidden
      `}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white transform translate-x-8 -translate-y-8" />
          <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white transform -translate-x-6 translate-y-6" />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold">💡 Did you know?</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleNewTrivia}
              className="p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
              title="New trivia"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          <div className="flex items-start space-x-3">
            <span className="text-2xl flex-shrink-0 mt-1">
              {currentTrivia.icon}
            </span>
            <p className="text-sm font-medium leading-relaxed">
              {currentTrivia.text}
            </p>
          </div>

          {/* Category badge */}
          <div className="mt-3 flex justify-end">
            <span className="px-2 py-1 text-xs font-semibold bg-white/20 rounded-full capitalize">
              {currentTrivia.category}
            </span>
          </div>
        </div>

        {/* Auto-rotate progress bar */}
        {autoRotate && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
            <div
              className="h-full bg-white/40 animate-progress-bar"
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
  );
};

export default TriviaPopup;