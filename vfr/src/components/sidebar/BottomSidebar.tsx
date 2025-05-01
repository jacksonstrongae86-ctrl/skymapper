import React, { useRef } from 'react';

interface BottomSidebarProps {
  results: React.ReactNode;
  sidebarWidth: number;
  isMinimized: boolean;
  isFullScreen: boolean;
  onHeightChange?: (height: number) => void; // Add this
}

interface PrintableBottomSidebarProps extends BottomSidebarProps {
  waypoints: any[]; // Add proper type from your Waypoint interface
}

interface TableCell {
  type: string;
  props: {
    children: React.ReactNode;
  };
}

interface TableRow {
  props: {
    children: TableCell[];
  };
}

const BottomSidebar: React.FC<PrintableBottomSidebarProps> = ({ 
  results, 
  sidebarWidth,
  isMinimized,
  isFullScreen,
  waypoints,
  onHeightChange
}) => {
  const [isBottomMinimized, setIsBottomMinimized] = React.useState(false);
  const [height, setHeight] = React.useState(25); // Default height percentage
  const [isResizing, setIsResizing] = React.useState(false);

  const handleMinimizeMaximize = () => {
    const newHeight = isBottomMinimized ? 25 : 7;
    setHeight(newHeight);
    onHeightChange?.(newHeight);
    setIsBottomMinimized(!isBottomMinimized);
  };

  const handleFullScreen = () => {
    const newHeight = height >= 90 ? 25 : 100;
    setHeight(newHeight);
    onHeightChange?.(newHeight);
  };

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const windowHeight = window.innerHeight;
      const fromBottom = windowHeight - e.clientY;
      const percentage = (fromBottom / windowHeight) * 100;
      // Limit height between 10% and 75%
      const newHeight = Math.min(75, Math.max(10, percentage));
      setHeight(newHeight);
      onHeightChange?.(newHeight);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handlePrint = () => {
    // Store current scroll position
    const scrollPos = window.scrollY;
  
    // Create print container
    const printContent = document.createElement('div');
    printContent.className = 'print-content';
  
    // Create map page
    const mapElement = document.querySelector('.leaflet-container')?.cloneNode(true) as HTMLElement;
    if (mapElement) {
      const mapContainer = document.createElement('div');
      mapContainer.className = 'print-map';
      mapContainer.innerHTML = `
        <div class="print-header">Flight Plan Map</div>
        <div class="print-map-container">
          ${mapElement.outerHTML}
        </div>
      `;
      printContent.appendChild(mapContainer);
    }
  
    // Create results section with horizontal table
    const resultsSection = document.createElement('div');
    resultsSection.className = 'print-results';
    resultsSection.innerHTML = `
      <div class="print-header">Flight Plan Details</div>
      <div class="print-info">
        <div class="print-info-grid">
          <p><strong>Total Waypoints:</strong> ${waypoints.length}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <table class="print-table">
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
          ${Array.isArray(results) 
            ? (results as TableRow[]).map((result, index) => {
                const cells = result.props.children
                  .filter((child): child is TableCell => child.type === 'td');
                
                return `
                  <tr>
                    ${cells.map(cell => `<td>${cell.props.children}</td>`).join('')}
                  </tr>
                `;
              }).join('')
            : ''
          }
        </tbody>
      </table>
    `;
    printContent.appendChild(resultsSection);
  
    // Add to document temporarily
    document.body.appendChild(printContent);
  
    // Trigger print
    window.print();
  
    // Cleanup
    document.body.removeChild(printContent);
    window.scrollTo(0, scrollPos);
  };

  return (
    <div 
      className="fixed bottom-0 text-[var(--results-text)] shadow-lg z-40 transition-all duration-300"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)",
        left: isFullScreen ? '0' : (isMinimized ? '48px' : `${sidebarWidth}px`),
        width: isFullScreen ? '100%' : `calc(100% - ${sidebarWidth}px)`,
        height: `${height}%`
      }}
    >
      {/* Add resize handle at the top */}
      {!isBottomMinimized && (
        <div
          className="absolute top-0 left-0 right-0 h-2 z-40 group cursor-ns-resize flex items-center justify-center"
          onMouseDown={handleMouseDown}
        >
          {/* Horizontal line with hover effect */}
          <div className="w-full h-full bg-[var(--button-bg)] group-hover:bg-[var(--button-hover)] transition-colors duration-200"></div>

          {/* Resize indicator dots */}
          <div className="absolute flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          </div>
        </div>
      )}

      <div className="h-full overflow-auto custom-scrollbar">
        {/* Enhanced header with controls */}
        <div className="sticky top-0 z-10 bg-[var(--sidebar-bg)] p-4 border-b border-[var(--sidebar-border)]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Flight Results</h2>
              <span className="px-2 py-1 bg-[var(--background)] rounded-full text-sm font-medium">
                {Array.isArray(results) ? results.length : 0} legs
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isBottomMinimized && (
                  <button
                  className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center text-gray-800 text-xs"
                  onClick={handleFullScreen}
                  title={height >= 90 ? "Exit Full Screen" : "Full Screen"}
                >
                  {height >= 90 ? "-" : "⌞ ⌝"}
                </button>
                )}
              {(height < 90) && (
              <button
                className="w-6 h-6 rounded-full bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center text-gray-800 text-xs"
                onClick={handleMinimizeMaximize}
                title={isBottomMinimized ? "Maximize" : "Minimize"}
              >
                {isBottomMinimized ? "+" : "-"}
              </button>
              )}
              <button
                className="bg-[var(--button-bg)] hover:bg-[var(--button-hover)] text-[var(--sidebar-text)] py-2 px-4 rounded-md 
                transition-colors duration-200 flex items-center gap-2 hover:shadow-lg ml-2"
                onClick={handlePrint}
              >
                <span>Print</span>
                <span>🖨️</span>
              </button>
            </div>
          </div>
        </div>

        {/* Show table only when not minimized */}
        {!isBottomMinimized && (
          <div className="p-4">
            <table className="w-full">
              <thead className="bg-yellow-800 sticky top-18.5 z-10">
                <tr>
                  {[
                    ['#', '', '🔢'],
                    ['Distance', 'NM', '📏'],
                    ['Track', '°', '🧭'],
                    ['Heading', '°', '➡️'],
                    ['GS', 'knots', '⚡'],
                    ['Time', 'min', '⏱️'],
                    ['TAS', 'knots', '✈️'],
                    ['Fuel', 'gal', '⛽'],
                    ['Wind', '', '💨']
                  ].map(([label, unit, icon]) => (
                    <th 
                      key={label}
                      className="py-3 px-4 text-left font-semibold first:rounded-tl-lg last:rounded-tr-lg whitespace-nowrap"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{icon}</span>
                        <div className="flex flex-col">
                          <span className="text-white">{label}</span>
                          {unit && <span className="text-xs text-slate-400">({unit})</span>}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[var(--results-text)]">
                {results}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomSidebar;