import { Waypoint } from "@/src/utils/types";
import { useCallback, JSX } from "react";
import React from "react";

interface UsePrintHandlerProps {
  results: JSX.Element[];
  waypoints: Waypoint[];
  fuelConsumption: number;
  selectedDate?: string;
  selectedTime?: string;
  gal_liter: string;
}

interface FlightData {
  distance: number;
  track: number;
  heading: number;
  groundSpeed: number;
  time: number;
  fuelBurn: number;
  waypoint: string;
  tas?: number;
  wind?: string;
}

// Helper function to safely extract text content from JSX elements
const extractTextContent = (element: React.ReactNode): string => {
  if (typeof element === "string" || typeof element === "number") {
    return String(element);
  }
  if (typeof element === "bigint") {
    return String(element);
  }
  if (
    typeof element === "boolean" ||
    element === null ||
    element === undefined
  ) {
    return "";
  }
  if (React.isValidElement(element)) {
    const props = element.props as { children?: React.ReactNode };
    if (props.children) {
      if (Array.isArray(props.children)) {
        return props.children.map(extractTextContent).join("");
      }
      return extractTextContent(props.children);
    }
  }
  if (Array.isArray(element)) {
    return element.map(extractTextContent).join("");
  }
  return "";
};
// Helper function to safely extract numeric values from JSX elements
const extractNumericValue = (element: React.ReactNode): number => {
  const textContent = extractTextContent(element);
  const numericValue = parseFloat(textContent);
  return isNaN(numericValue) ? 0 : numericValue;
};

// Helper function to extract flight data from results
// Enhanced flight data extraction
const extractFlightData = (
  results: JSX.Element[],
  waypoints: Waypoint[]
): FlightData[] => {
  return results.map((result, index) => {
    const tableData = result.props?.children || [];
    const waypoint = waypoints[index];

    // Extract waypoint name from first cell
    const waypointCell = tableData[0];
    let waypointName = `WP${index + 1}`;
    if (waypointCell?.props?.children?.props?.children) {
      const mainText = waypointCell.props.children.props.children[0];
      if (typeof mainText === "string") {
        waypointName = mainText;
      }
    }

    // Add indicators for transition and named waypoints
    const indicators = [];
    if (waypoint?.isTransition) {
      indicators.push("🔄");
    }
    if (waypoint?.name) {
      indicators.push("📍");
      waypointName = waypoint.name; // Use the actual name
    }

    const finalWaypointName =
      indicators.length > 0
        ? `${waypointName} ${indicators.join(" ")}`
        : waypointName;

    return {
      waypoint: finalWaypointName,
      distance: extractNumericValue(tableData[1]),
      track: extractNumericValue(tableData[2]),
      heading: extractNumericValue(tableData[3]),
      groundSpeed: extractNumericValue(tableData[4]),
      time: extractNumericValue(tableData[5]),
      tas: extractNumericValue(tableData[6]),
      fuelBurn: extractNumericValue(tableData[7]),
      wind: extractTextContent(tableData[8]),
    };
  });
};

export const generatePrintContent = (
  waypoints: Waypoint[],
  flightData: FlightData[],
  totalDistance: number,
  totalTime: number,
  totalFuel: number,
  fuelConsumption: number,
  gal_liter: string,
  selectedDate?: string,
  selectedTime?: string
) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return `
    <div class="print-container">
      <style>
        .print-container {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .print-header {
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .print-header h1 {
          margin: 0 0 10px 0;
          color: #333;
        }
        .print-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        .print-summary p {
          margin: 5px 0;
          padding: 8px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
        .print-waypoints {
          margin-bottom: 20px;
        }
        .print-waypoints h2 {
          color: #333;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
        }
        .waypoint-list li.transition-waypoint {
          border-left: 4px solid #ffc107;
          background-color: #fff9c4;
        }

        .waypoint-list li.named-waypoint {
          border-left: 4px solid #28a745;
          background-color: #d4edda;
        }

        .waypoint-list li.transition-waypoint.named-waypoint {
          border-left: 4px solid #6f42c1;
          background-color: #e2d9f3;
        }

        .transition-indicator {
          color: #856404;
          font-size: 0.85em;
          font-weight: bold;
        }

        .named-indicator {
          color: #155724;
          font-size: 0.85em;
          font-weight: bold;
        }

        .coordinates {
          color: #666;
          font-size: 0.9em;
        }

        .print-results td:first-child {
          text-align: left;
          font-weight: bold;
}

        @media print {
          .print-container {
            max-width: none;
            margin: 0;
            padding: 0;
          }
        }
      </style>

      <div class="print-header">
        <h1>✈️ Flight Plan Summary</h1>
        <div class="print-summary">
          <p><strong>Total Distance:</strong> ${totalDistance.toFixed(2)} NM</p>
          <p><strong>Total Time:</strong> ${formatTime(totalTime)}</p>
          <p><strong>Total Fuel Burn:</strong> ${totalFuel.toFixed(
            2
          )} ${gal_liter}</p>
          <p><strong>Fuel Consumption:</strong> ${fuelConsumption.toFixed(
            2
          )} ${gal_liter}/hr</p>
          ${selectedDate ? `<p><strong>Date:</strong> ${selectedDate}</p>` : ""}
          ${selectedTime ? `<p><strong>Time:</strong> ${selectedTime}</p>` : ""}
        </div>
      </div>

      <div class="print-waypoints">
        <h2>📍 Waypoints</h2>
        <ul class="waypoint-list">
          ${waypoints
            .map((wp, index) => {
              let waypointLabel = `WP${index + 1}`;
              const indicators = [];

              // Add transition indicator
              if (wp.isTransition) {
                indicators.push(
                  '<span class="transition-indicator">🔄 TRANSITION</span>'
                );
              }

              // Add named waypoint indicator
              if (wp.name) {
                indicators.push(
                  `<span class="named-indicator">📍 ${wp.name}</span>`
                );
                waypointLabel = wp.name; // Use the name as the primary label
              }

              const indicatorText =
                indicators.length > 0 ? `<br>${indicators.join(" ")}` : "";

              return `
              <li class="${wp.isTransition ? "transition-waypoint" : ""} ${
                wp.name ? "named-waypoint" : ""
              }">
                <strong>${waypointLabel}</strong>${indicatorText}<br>
                <span class="coordinates">${
                  Array.isArray(wp.position)
                    ? wp.position.join(", ")
                    : wp.position
                }</span>
              </li>
            `;
            })
            .join("")}
        </ul>
      </div>


      <div class="print-results">
        <h2>📊 Flight Data</h2>
        <table>
          <thead>
            <tr>
              <th>Waypoint</th>
              <th>Distance (NM)</th>
              <th>Track (°)</th>
              <th>Heading (°)</th>
              <th>GS (knots)</th>
              <th>Time (min)</th>
              <th>TAS (knots)</th>
              <th>Fuel (${gal_liter})</th>
              <th>Wind</th>
            </tr>
          </thead>
          <tbody>
            ${flightData
              .map(
                (data) => `
              <tr>
                <td><strong>${data.waypoint}</strong></td>
                <td>${data.distance.toFixed(2)}</td>
                <td>${data.track.toFixed(1)}</td>
                <td>${data.heading.toFixed(1)}</td>
                <td>${data.groundSpeed.toFixed(1)}</td>
                <td>${data.time.toFixed(1)}</td>
                <td>${data.tas ? data.tas.toFixed(1) : "N/A"}</td>
                <td>${data.fuelBurn.toFixed(2)}</td>
                <td>${data.wind || "N/A"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

export const usePrintHandler = ({
  results,
  waypoints,
  fuelConsumption,
  selectedDate,
  selectedTime,
  gal_liter,
}: UsePrintHandlerProps) => {
  const handlePrint = useCallback(() => {
    if (typeof window === "undefined") return;

    const scrollPos = window.scrollY;

    try {
      // Extract flight data from results
      const flightData = extractFlightData(results, waypoints);

      // Calculate totals
      const totalDistance = flightData.reduce(
        (acc, data) => acc + data.distance,
        0
      );
      const totalTime = flightData.reduce((acc, data) => acc + data.time, 0);
      const totalFuel = flightData.reduce(
        (acc, data) => acc + data.fuelBurn,
        0
      );

      // Create print window
      const printWindow = window.open("", "_blank", "width=800,height=600");

      if (!printWindow) {
        // Fallback: create print content in current window
        const printContent = document.createElement("div");
        printContent.className = "print-content";
        printContent.innerHTML = generatePrintContent(
          waypoints,
          flightData,
          totalDistance,
          totalTime,
          totalFuel,
          fuelConsumption,
          gal_liter,
          selectedDate,
          selectedTime
        );

        // Add print styles
        const printStyles = document.createElement("style");
        printStyles.textContent = `
          @media print {
            body * {
              visibility: hidden;
            }
            .print-content, .print-content * {
              visibility: visible;
            }
            .print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `;

        document.head.appendChild(printStyles);
        document.body.appendChild(printContent);

        // Print and cleanup
        setTimeout(() => {
          window.print();
          document.body.removeChild(printContent);
          document.head.removeChild(printStyles);
          window.scrollTo(0, scrollPos);
        }, 100);
      } else {
        // Use print window
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Flight Plan - ${new Date().toLocaleDateString()}</title>
              <meta charset="utf-8">
            </head>
            <body>
              ${generatePrintContent(
                waypoints,
                flightData,
                totalDistance,
                totalTime,
                totalFuel,
                fuelConsumption,
                gal_liter,
                selectedDate,
                selectedTime
              )}
            </body>
          </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        // Wait for content to load then print
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    } catch (error) {
      console.error("Print failed:", error);
      alert("Failed to generate print content. Please try again.");
    }
  }, [
    results,
    waypoints,
    fuelConsumption,
    selectedDate,
    selectedTime,
    gal_liter,
  ]);

  return handlePrint;
};
