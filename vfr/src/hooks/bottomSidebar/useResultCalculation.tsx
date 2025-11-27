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
  nextVisibleIndex: number,
  waypoints: Waypoint[],
  i: number
): LegName => {
  const isTransition = !wp.visible;
  const prevWp = waypoints[i];
  const nextWp = waypoints[i + 1];

  // Get names or fallback to WP index
  const prevName = prevWp?.name?.trim() ? prevWp.name : `WP${visibleIndex + 1}`;
  const nextName = nextWp?.name?.trim() ? nextWp.name : `WP${nextVisibleIndex}`;

  if (isTransition) {
    // If previous is transition, show "Transition → name2"
    if (!prevWp.visible && nextWp) {
      return {
        mainText: `Transition → ${nextName}`,
        isSpecialFormat: true,
      };
    }
    // If next is transition, show "name1 → Transition"
    if (prevWp && !nextWp?.visible) {
      return {
        mainText: `${prevName} → Transition`,
        isSpecialFormat: true,
      };
    }
    // Default for transition
    return {
      mainText: `Transition`,
      isSpecialFormat: true,
    };
  }

  if (["BOC", "TOC", "TOD", "BOD"].includes(wp.type)) {
    const isClimb = ["BOC", "TOC"].includes(wp.type);
    return {
      mainText: `${prevName} → ${nextName}`,
      subText: isClimb ? "Climb" : "Descent",
      isSpecialFormat: true,
    };
  }

  return {
    mainText: `${prevName} → ${nextName}`,
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
  waypoints,
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
  waypoints: Waypoint[],
}) => {
  const { distance, track, heading, gs, time, tas, fuelBurn, windInfo } = calculations;
  const legName = formatLegName(wp, visibleIndex, nextVisibleIndex, waypoints, i);

  return (
    <tr key={i} className={rowClass}>
      <td className="py-3 px-4 border-b border-slate-700/50">
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
      <td className="py-3 px-4 border-b border-slate-700/50">
        {distance.toFixed(1)}
      </td>
      <td className="py-3 px-4 border-b border-slate-700/50">
        {track.toFixed(0)}
      </td>
      <td className="py-3 px-4 border-b border-slate-700/50">
        {heading.toFixed(0)}
      </td>
      <td className="py-3 px-4 border-b border-slate-700/50">
        {gs.toFixed(0)}
      </td>
      <td className="py-3 px-4 border-b border-slate-700/50">
        {time.toFixed(1)}
      </td>
      <td className="py-3 px-4 border-b border-slate-700/50">
        {tas.toFixed(0)}
      </td>
      <td className="py-3 px-4 border-b border-slate-700/50">
        {fuelBurn.toFixed(1)}
      </td>
      <td className="py-3 px-4 border-b border-slate-700/50">
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

        // Determine if this is a special segment (climb/descent)
        const isSpecialSegment =
          (wp.specialFuel && ["BOC", "TOD"].includes(wp.type) && nextWp.isTransition) ||
          (wp.isTransition && nextWp.specialFuel && ["TOC", "BOD"].includes(nextWp.type));

        const rowClass = `
          transition-colors duration-150
          ${isSpecialSegment ? "bg-blue-900/30 font-semibold" : i % 2 === 0 ? "bg-[var(--results-bg2)]" : "bg-[var(--results-bg1)]"}
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

        // Determine which IAS to use based on segment type
        let iasToUse = wp.ias;

        // Check if this is a climb/descent segment and get the appropriate IAS
        if (wp.specialFuel && ["BOC", "TOD"].includes(wp.type) && nextWp.isTransition) {
          // Climb/descent segment: use iasClimbDescent
          iasToUse = wp.iasClimbDescent || wp.ias;
        } else if (wp.isTransition && nextWp.specialFuel && ["TOC", "BOD"].includes(nextWp.type)) {
          // Climb/descent segment: use iasClimbDescent
          iasToUse = nextWp.iasClimbDescent || nextWp.ias;
        } else if (wp.isTransition && !nextWp.isTransition) {
          // Cruise segment after climb/descent: look back to find the BOC/TOD waypoint
          // and use its normal IAS
          const prevWp = waypoints[i - 1];
          if (prevWp && ["BOC", "TOD"].includes(prevWp.type)) {
            iasToUse = prevWp.ias;
          }
        }

        const tas = IAStoTAS(iasToUse, wp.altitude / 100);
        const heading = getHeading(track, tas, windInfo.direction, windInfo.speed);
        const gs = getGroundSpeed(track, tas, windInfo.direction, windInfo.speed);

        // Calculate time - for climb/descent segments, use altitude/ROC, not distance/GS
        let time = (distance / gs) * 60;

        // Determine fuel consumption and override time for climb/descent
        let currentFuelConsumption = fuelConsumption;

        // For BOC/TOD: special fuel and fixed time apply to segment FROM wp TO transition
        if (wp.specialFuel && ["BOC", "TOD"].includes(wp.type) && nextWp.isTransition) {
          currentFuelConsumption = wp.specialFuel;
          // Calculate time from altitude change and ROC
          const altChange = wp.altitudeChange || 0;
          const rocRod = wp.rocRod || 500;
          time = Math.abs(altChange) / rocRod;
        }
        // For TOC/BOD: special fuel and fixed time apply to segment FROM transition TO wp
        else if (wp.isTransition && nextWp.specialFuel && ["TOC", "BOD"].includes(nextWp.type)) {
          currentFuelConsumption = nextWp.specialFuel;
          // Calculate time from altitude change and ROC
          const altChange = nextWp.altitudeChange || 0;
          const rocRod = nextWp.rocRod || 500;
          time = Math.abs(altChange) / rocRod;
        }

        const fuelBurn = (time / 60) * currentFuelConsumption;

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
          waypoints,
        });
      })
      .filter(Boolean);

    setResults(newResults);
  }, [waypoints, storedWindData, fuelConsumption]);

  return results;
};
