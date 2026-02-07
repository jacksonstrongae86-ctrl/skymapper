import { renderToString } from 'react-dom/server';
import L from 'leaflet';
import {
  Navigation,
  PlaneTakeoff,
  MoveUp,
  MoveDown,
  PlaneLanding,
  AlertTriangle
} from 'lucide-react';

export const createWaypointIcon = (type: string, theme: string, hasViolation?: boolean) => {
  const getIcon = () => {
    if (hasViolation) {
      return <AlertTriangle size={20} color="currentColor" />;
    }

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
      ${`button-gradient-${theme} text-[var(--button-text)] border-[var(--sidebar-border)]`}
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
