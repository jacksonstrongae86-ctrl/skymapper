import { Waypoint } from "@/src/utils/types";
import { useCallback, JSX } from "react";
import React from "react";

interface UsePrintHandlerProps {
  results: JSX.Element[];
  waypoints: Waypoint[];
  fuelConsumption: number;
  selectedDate?: string;
  selectedTime?: string;
}

interface FlightData {
  name?: string;
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
const extractFlightData = (results: JSX.Element[]): FlightData[] => {
  return results.map((result, index) => {
    // The structure is <tr><td>...</td><td>...</td>...</tr>
    const tableData = result.props?.children || [];

    // Extract waypoint name from first cell
    const waypointCell = tableData[0];
    let waypointName = `WP${index + 1}`;

    // Try to extract the mainText from the cell (which may be a span or string)
    if (waypointCell?.props?.children) {
      // If it's a React element (e.g., <div><span>name</span></div>)
      const children = waypointCell.props.children;
      if (typeof children === "string") {
        waypointName = children;
      } else if (Array.isArray(children)) {
        // Look for a span or string in the children
        const mainSpan = children.find(
          (child: unknown) =>
            (typeof child === "string" && child.trim() !== "") ||
            (React.isValidElement(child) && child.type === "span")
        );
        if (mainSpan) {
          if (typeof mainSpan === "string") {
            waypointName = mainSpan;
          } else if (
            React.isValidElement(mainSpan) &&
            mainSpan.props &&
            typeof (mainSpan.props as { children?: unknown }).children ===
              "string"
          ) {
            waypointName = (mainSpan.props as { children?: string })
              .children as string;
          }
        }
      } else if (
        React.isValidElement(children) &&
        typeof (children.props as { children?: unknown }).children === "string"
      ) {
        waypointName = (children as React.ReactElement<{ children?: unknown }>)
          .props.children as string;
      }
    }

    // If the name includes "Transition", keep as is
    // Otherwise, if the name is empty, fallback to WP{index+1}
    if (!waypointName || waypointName.trim() === "") {
      waypointName = `WP${index + 1}`;
    }

    return {
      waypoint: waypointName,
      distance: extractNumericValue(tableData[1]), // Distance column
      track: extractNumericValue(tableData[2]), // Track column
      heading: extractNumericValue(tableData[3]), // Heading column
      groundSpeed: extractNumericValue(tableData[4]), // Ground Speed column
      time: extractNumericValue(tableData[5]), // Time column
      tas: extractNumericValue(tableData[6]), // TAS column
      fuelBurn: extractNumericValue(tableData[7]), // Fuel Burn column
      wind: extractTextContent(tableData[8]), // Wind column
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
        .waypoint-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 10px;
          list-style: none;
          padding: 0;
        }
        .waypoint-list li {
          background-color: #f9f9f9;
          padding: 8px;
          border-radius: 4px;
          border-left: 4px solid #007bff;
        }
        .print-results table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .print-results th,
        .print-results td {
          padding: 8px;
          text-align: center;
          border: 1px solid #ddd;
        }
        .print-results th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        .print-results tr:nth-child(even) {
          background-color: #f9f9f9;
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
          <p><strong>Total Fuel Burn:</strong> ${totalFuel.toFixed(2)} Gal</p>
          <p><strong>Fuel Consumption:</strong> ${fuelConsumption.toFixed(
            2
          )} Gal/hr</p>
          ${selectedDate ? `<p><strong>Date:</strong> ${selectedDate}</p>` : ""}
          ${selectedTime ? `<p><strong>Time:</strong> ${selectedTime}</p>` : ""}
        </div>
      </div>

      <div class="print-waypoints">
        <h2>📍 Waypoints</h2>
        <ul class="waypoint-list">
          ${waypoints
            .map((wp, index) => {
              let label = "";
              if (wp.isTransition) {
                label = "Transition";
              } else if (wp.name && wp.name.trim() !== "") {
                label = wp.name;
              } else {
                label = `WP${index + 1}`;
              }
              return `
              <li>
                <strong>${label}</strong><br>
                ${
                  Array.isArray(wp.position)
                    ? wp.position.join(", ")
                    : wp.position
                }
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
              <th>Fuel (gal)</th>
              <th>Wind</th>
            </tr>
          </thead>
          <tbody>
            ${flightData
              .map((data, i) => {
                // Try to match the flightData row to the corresponding waypoint
                let label = "";
                const wp = waypoints[i];
                if (wp && wp.isTransition) {
                  label = "Transition";
                } else if (wp && wp.name && wp.name.trim() !== "") {
                  label = wp.name;
                } else if (data.name && data.name.trim() !== "") {
                  label = data.name;
                } else if (data.waypoint && data.waypoint.trim() !== "") {
                  label = data.waypoint;
                } else {
                  label = `WP${i + 1}`;
                }
                return `
                <tr>
                  <td><strong>${label}</strong></td>
                  <td>${data.distance.toFixed(2)}</td>
                  <td>${data.track.toFixed(1)}</td>
                  <td>${data.heading.toFixed(1)}</td>
                  <td>${data.groundSpeed.toFixed(1)}</td>
                  <td>${data.time.toFixed(1)}</td>
                  <td>${data.tas ? data.tas.toFixed(1) : "N/A"}</td>
                  <td>${data.fuelBurn.toFixed(2)}</td>
                  <td>${data.wind || "N/A"}</td>
                </tr>
              `;
              })
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
}: UsePrintHandlerProps) => {
  const handlePrint = useCallback(() => {
    if (typeof window === "undefined") return;

    const scrollPos = window.scrollY;

    try {
      // Extract flight data from results
      const flightData = extractFlightData(results);

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
  }, [results, waypoints, fuelConsumption, selectedDate, selectedTime]);

  return handlePrint;
};
