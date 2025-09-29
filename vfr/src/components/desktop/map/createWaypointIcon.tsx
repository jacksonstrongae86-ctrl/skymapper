import { renderToString } from 'react-dom/server';
import L from 'leaflet';
import {
  Navigation,
  PlaneTakeoff,
  MoveUp,
  MoveDown,
  PlaneLanding
} from 'lucide-react';

export const createWaypointIcon = (type: string, theme: string, hasViolation?: boolean) => {
  const getIcon = () => {
    switch (type) {
      case 'BOC':
        return <PlaneTakeoff size={20} color="currentColor" />;
      case 'TOC':
        return <MoveUp size={20} color="currentColor" />;
      case 'TOD':
        return <MoveDown size={20} color="currentColor" />;
      case 'BOD':
        return <PlaneLanding size={20} color="currentColor" />;
      default:
        return <Navigation size={20} color="currentColor" />;
    }
  };

  const html = renderToString(
    <div className={`
      w-8 h-8
      flex items-center justify-center
      rounded-full
      ${hasViolation
        ? 'bg-red-600 border-red-800 text-white animate-pulse shadow-red-500/50'
        : `button-gradient-${theme} text-[var(--button-text)] border-[var(--sidebar-border)]`
      }
      border-2
      shadow-lg
    `}>
      {getIcon()}
    </div>
  );

  return L.divIcon({
    html,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};
