import { JSX } from "react";
import { Waypoint } from "@/src/utils/types";
export const handlePrint = (
  results: JSX.Element[],
  waypoints: Waypoint[],
  fuelConsumption: number
) => {
  if (typeof window === "undefined") return;
  const scrollPos = window.scrollY;

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

  const printContent = document.createElement("div");
  printContent.className = "print-content";

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

  const resultsSection = document.createElement("div");
  resultsSection.className = "print-results";
  resultsSection.innerHTML = generatePrintHTML(
    waypoints,
    totalDistance,
    totalTime,
    totalFuel,
    fuelConsumption,
    results
  );

  printContent.appendChild(resultsSection);
  document.body.appendChild(printContent);
  window.print();
  document.body.removeChild(printContent);
  window.scrollTo(0, scrollPos);
};

const generatePrintHTML = (
  waypoints: Waypoint[],
  totalDistance: number,
  totalTime: number,
  totalFuel: number,
  fuelConsumption: number,
  results: JSX.Element[]
) => {
  return `
    <div class="print-header">Flight Plan Details</div>
    <div class="print-info">
      <div class="print-info-grid">
        <p><strong>Total Waypoints:</strong> ${waypoints.length}</p>
        <p><strong>Total Distance:</strong> ${totalDistance.toFixed(1)} NM</p>
        <p><strong>Total Time:</strong> ${totalTime.toFixed(1)} min</p>
        <p><strong>Total Fuel:</strong> ${totalFuel.toFixed(1)} gal</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Fuel Consumption:</strong> ${fuelConsumption} gal/hr</p>
      </div>
    </div>
    <table class="print-table">
      <thead>
        <tr>
          <th>Leg</th>
          <th>Distance (NM)</th>
          <th>Track (°)</th>
          <th>Heading (°)</th>
          <th>Ground Speed (kt)</th>
          <th>Time (min)</th>
          <th>True Airspeed (kt)</th>
          <th>Fuel (gal)</th>
          <th>Wind</th>
        </tr>
      </thead>
      <tbody>
        ${results
          .map(
            (result) =>
              `<tr>
            ${result.props.children
              .map(
                (child: { props: { children: string | number } }) =>
                  `<td>${child.props.children}</td>`
              )
              .join("")}
          </tr>`
          )
          .join("\n")}
      </tbody>
    </table>
  `;
};
