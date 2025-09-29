import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { getRandomTrivia, getCategoryColor, TriviaItem } from '@/src/utils/triviaData';

interface HeaderTriviaProps {
  autoRotate?: boolean;
  rotateInterval?: number; // milliseconds
  isMobile?: boolean;
}

const HeaderTrivia: React.FC<HeaderTriviaProps> = ({
  autoRotate = true,
  rotateInterval = 20000, // 20 seconds
  isMobile = false
}) => {
  const [currentTrivia, setCurrentTrivia] = useState<TriviaItem>(getRandomTrivia());
  const [isScrolling, setIsScrolling] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  // Auto-rotate trivia
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setCurrentTrivia(getRandomTrivia());
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval]);

  // Check if text overflows and enable scrolling
  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const container = textRef.current.parentElement;
        if (container) {
          // Reset animation to measure natural width
          textRef.current.style.animation = 'none';
          textRef.current.style.transform = 'none';

          // Force layout recalculation
          const textWidth = textRef.current.scrollWidth;
          const containerWidth = container.clientWidth;

          console.log('Text width:', textWidth, 'Container width:', containerWidth);

          const needsScrolling = textWidth > containerWidth - 10; // 10px buffer

          console.log('Needs scrolling:', needsScrolling);

          setIsScrolling(needsScrolling);

          // Re-enable animation
          if (needsScrolling) {
            setTimeout(() => {
              if (textRef.current) {
                textRef.current.style.animation = '';
                textRef.current.style.transform = '';
              }
            }, 50);
          }
        }
      }
    };

    // Multiple checks to ensure we catch the overflow
    const timer1 = setTimeout(checkOverflow, 50);
    const timer2 = setTimeout(checkOverflow, 200);
    const timer3 = setTimeout(checkOverflow, 500);

    window.addEventListener('resize', checkOverflow);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [currentTrivia]);

  const handleNewTrivia = () => {
    setCurrentTrivia(getRandomTrivia());
  };

  const gradientClass = getCategoryColor(currentTrivia.category);

  return (
    <div className={`
      flex items-center space-x-2
      ${isMobile ? 'px-2 py-1' : 'px-3 py-1'}
      bg-gradient-to-r ${gradientClass}
      rounded-md text-white ${isMobile ? 'text-sm' : 'text-sm'} font-medium
      border border-white/20
      w-full min-h-0 max-w-full
    `}>
      {/* Icon */}
      <span className={`${isMobile ? 'text-sm' : 'text-base'} flex-shrink-0`}>
        {currentTrivia.icon}
      </span>

      {/* Text content with carousel */}
      <div className="flex-1 min-w-0 overflow-hidden relative">
        <div className="overflow-hidden w-full">
          <p
            ref={textRef}
            className={`
              ${isMobile ? 'text-sm' : 'text-sm'} leading-tight whitespace-nowrap
              ${isScrolling ? 'animate-scroll' : ''}
              inline-block min-w-full
            `}
            style={{
              paddingRight: isScrolling ? '50px' : '0',
            }}
          >
            {currentTrivia.text}
          </p>
        </div>
      </div>

      {/* Refresh button */}
      <button
        onClick={handleNewTrivia}
        className="p-1 rounded-full hover:bg-white/20 transition-colors duration-200 flex-shrink-0"
        title="New tip"
      >
        <RefreshCw className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
      </button>

      {/* Category badge - only on desktop when not scrolling */}
      {!isMobile && !isScrolling && (
        <span className="px-2 py-0.5 text-xs font-semibold bg-white/20 rounded-full capitalize flex-shrink-0">
          {currentTrivia.category}
        </span>
      )}
    </div>
  );
};

export default HeaderTrivia;