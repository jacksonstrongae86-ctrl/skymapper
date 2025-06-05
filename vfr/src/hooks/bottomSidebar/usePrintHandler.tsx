import { Waypoint } from '@/src/utils/types';
import { useCallback, JSX } from 'react';

interface UsePrintHandlerProps {
  results: JSX.Element[];
  waypoints: Waypoint[];
  fuelConsumption: number;
}
export const generatePrintContent = (
    waypoints: Waypoint[],
    results: JSX.Element[],
    totalDistance: number,
    totalTime: number,
    totalFuel: number,
    fuelConsumption: number
) => {
    return `
        <div class="print-header">
        <h1>Flight Plan Summary</h1>
        <p>Total Distance: ${totalDistance.toFixed(2)} NM</p>
        <p>Total Time: ${Math.floor(totalTime / 60)}h ${Math.round(totalTime % 60)}m</p>
        <p>Total Fuel Burn: ${totalFuel.toFixed(2)} L</p>
        <p>Fuel Consumption: ${fuelConsumption.toFixed(2)} L/h</p>
        </div>
        <div class="print-waypoints">
        <h2>Waypoints</h2>
        <ul>
            ${waypoints.map((wp, index) => `<li>WP${index + 1} (${wp.position.join(', ')})</li>`).join('')}
        </ul>
        </div>
        <div class="print-results">
        <h2>Results</h2>
        <table>
            <thead>
            <tr>
                <th>Waypoint</th>
                <th>Distance (NM)</th>
                <th>Track (°)</th>
                <th>Heading (°)</th>
                <th>Ground Speed (KT)</th>
                <th>Time (min)</th>
                <th>Fuel Burn (L)</th>
            </tr>
            </thead>
            <tbody>
            ${results.map(result => result.props.children).join('')}
            </tbody>
        </table>
        </div>`;
    }

export const usePrintHandler = ({
  results,
  waypoints,
  fuelConsumption,
}: UsePrintHandlerProps) => {
  const handlePrint = useCallback(() => {
    if (typeof window === "undefined") return;

    const scrollPos = window.scrollY;

    // Calculate totals
    const totalDistance = results.reduce(
      (acc, result) => acc + parseFloat(result.props.children[1].props.children),
      0
    );
    const totalTime = results.reduce(
      (acc, result) => acc + parseFloat(result.props.children[5].props.children),
      0
    );
    const totalFuel = results.reduce(
      (acc, result) => acc + parseFloat(result.props.children[7].props.children),
      0
    );

    // Create print content
    const printContent = document.createElement("div");
    printContent.className = "print-content";

    // Add map if available
    const mapElement = document.querySelector(".leaflet-container");
    if (mapElement) {
      const mapContainer = document.createElement("div");
      mapContainer.className = "print-map";
      mapContainer.innerHTML = `
        <div class="print-header">Flight Plan Map</div>
        <div class="print-map-container">
          ${mapElement.outerHTML}
        </div>
      `;
      printContent.appendChild(mapContainer);
    }

    // Add results
    const resultsSection = document.createElement("div");
    resultsSection.className = "print-results";
    resultsSection.innerHTML = generatePrintContent(
      waypoints,
      results,
      totalDistance,
      totalTime,
      totalFuel,
      fuelConsumption
    );

    printContent.appendChild(resultsSection);
    document.body.appendChild(printContent);

    window.print();

    document.body.removeChild(printContent);
    window.scrollTo(0, scrollPos);
  }, [results, waypoints, fuelConsumption]);

  return handlePrint;
};
