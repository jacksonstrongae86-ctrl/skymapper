import React from 'react';

interface BottomSidebarProps {
  results: React.ReactNode;
}

const BottomSidebar: React.FC<BottomSidebarProps> = ({ results }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full h-1/4 bg-slate-900 text-white p-4 shadow-lg z-40">
      <div className="h-full overflow-auto">
        <h2 className="text-lg font-semibold mb-2 sticky top-0 bg-slate-900">Results</h2>
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-gray-400 uppercase bg-gray-700 sticky top-8">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Distance (NM)</th>
              <th className="px-4 py-2">Track (°)</th>
              <th className="px-4 py-2">Heading (°)</th>
              <th className="px-4 py-2">GS (knots)</th>
              <th className="px-4 py-2">Time (min)</th>
              <th className="px-4 py-2">TAS (knots)</th>
              <th className="px-4 py-2">Fuel</th>
              <th className="px-4 py-2">Wind</th>
            </tr>
          </thead>
          <tbody>{results}</tbody>
        </table>
      </div>
      <button
        className="absolute top-2 right-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
        onClick={() => window.print()}
      >
        Print Results 🖨️
      </button>
    </div>
  );
};

export default BottomSidebar;