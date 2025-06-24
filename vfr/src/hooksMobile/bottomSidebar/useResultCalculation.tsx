import { useState, useEffect, JSX } from 'react';
import {
  IAStoTAS,
  getDistance,
  getBearing,
  getHeading,
  getGroundSpeed,
} from '@/src/utils/logic';
import { Waypoint, WindDataArray } from '@/src/utils/types';

interface LegName {
  mainText: string;
  subText?: string;
  isSpecialFormat: boolean;
}

const formatLegName = (
  wp: Waypoint,
  visibleIndex: number,
  nextVisibleIndex: number
): LegName => {
  const isTransition = !wp.visible;

  if (isTransition) {
    return {
      mainText: `Transition (${wp.type})`,
      isSpecialFormat: true,
    };
  }

  if (["BOC", "TOC", "TOD", "BOD"].includes(wp.type)) {
    return {
      mainText: `WP${visibleIndex + 1} → WP${nextVisibleIndex}`,
      subText: wp.type,
      isSpecialFormat: true,
    };
  }

  return {
    mainText: `WP${visibleIndex + 1} → WP${nextVisibleIndex}`,
    isSpecialFormat: false,
  };
};

const formatResultRow = ({
  wp,
  i,
  visibleIndex,
  nextVisibleIndex,
  rowClass,
  calculations,
}: {
  wp: Waypoint;
  i: number;
  visibleIndex: number;
  nextVisibleIndex: number;
  rowClass: string;
  calculations: {
    distance: number;
    track: number;
    heading: number;
    gs: number;
    time: number;
    tas: number;
    fuelBurn: number;
    windInfo: { speed: number; direction: number };
  };
}) => {
  const { distance, track, heading, gs, time, tas, fuelBurn, windInfo } = calculations;
  const legName = formatLegName(wp, visibleIndex, nextVisibleIndex);

  return (
    <tr key={i} className={rowClass}>
      <td className="py-1 px-4 border-b border-slate-700/50">
        <div className="flex flex-col">
          <span className={legName.isSpecialFormat ? "font-bold text-[var(--results-text)]" : ""}>
            {legName.mainText}
          </span>
          {legName.subText && (
            <span className="font-normal text-[var(--results-text)] text-xs">
              {legName.subText}
            </span>
          )}
        </div>
      </td>
      <td className="py-1 px-4 border-b border-slate-700/50">
        {distance.toFixed(1)}
      </td>
      <td className="py-1 px-4 border-b border-slate-700/50">
        {track.toFixed(0)}
      </td>
      <td className="py-1 px-4 border-b border-slate-700/50">
        {heading.toFixed(0)}
      </td>
      <td className="py-1 px-4 border-b border-slate-700/50">
        {gs.toFixed(0)}
      </td>
      <td className="py-1 px-4 border-b border-slate-700/50">
        {time.toFixed(1)}
      </td>
      <td className="py-1 px-4 border-b border-slate-700/50">
        {tas.toFixed(0)}
      </td>
      <td className="py-1 px-4 border-b border-slate-700/50">
        {fuelBurn.toFixed(1)}
      </td>
      <td className="py-1 px-4 border-b border-slate-700/50">
        {`${windInfo.speed.toFixed(1)} kt @ ${windInfo.direction.toFixed(0)}°`}
      </td>
    </tr>
  );
};

export const useResultsCalculation = ({
  waypoints,
  storedWindData,
  fuelConsumption,
}: {
  waypoints: Waypoint[];
  storedWindData: WindDataArray | null;
  fuelConsumption: number;
}
) => {
  const [results, setResults] = useState<JSX.Element[]>([]);

  useEffect(() => {
    if (waypoints.length < 2 || !storedWindData) {
      setResults([]);
      return;
    }

    const newResults = waypoints
      .slice(0, -1)
      .map((wp, i) => {
        const nextWp = waypoints[i + 1];
        const visibleIndex = waypoints.slice(0, i).filter((w) => w.visible !== false).length;
        const nextVisibleIndex = waypoints.slice(0, i + 2).filter((w) => w.visible !== false).length;

        // Row styling
        const isTransition = !wp.visible;
        const rowClass = `
          transition-colors duration-150
          ${isTransition ? "italic text-gray-500" : ""}
          ${i % 2 === 0 ? "bg-[var(--results-bg2)]" : "bg-[var(--results-bg1)]"}
          hover:bg-[var(--results-hover)]
        `;

        // Calculations
        const distance = getDistance(
          { lat: wp.position[0], lng: wp.position[1] },
          { lat: nextWp.position[0], lng: nextWp.position[1] }
        );
        const track = getBearing(
          { lat: wp.position[0], lng: wp.position[1] },
          { lat: nextWp.position[0], lng: nextWp.position[1] }
        );
        const windInfo = storedWindData[i] || { speed: 0, direction: 0 };
        const tas = IAStoTAS(wp.ias, wp.altitude / 100);
        const heading = getHeading(track, tas, windInfo.direction, windInfo.speed);
        const gs = getGroundSpeed(track, tas, windInfo.direction, windInfo.speed);
        const time = (distance / gs) * 60;
        const fuelBurn = (time / 60) * (wp.specialFuel || fuelConsumption);

        return formatResultRow({
          wp,
          i,
          visibleIndex,
          nextVisibleIndex,
          rowClass,
          calculations: {
            distance,
            track,
            heading,
            gs,
            time,
            tas,
            fuelBurn,
            windInfo,
          },
        });
      })
      .filter(Boolean);

    setResults(newResults);
  }, [waypoints, storedWindData, fuelConsumption]);

  return results;
};
