export default function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) {
  return (
    <div className={`fixed left-0 top-0 h-full w-64 bg-amber-50 text-black p-4 transition-transform ${isOpen ? "translate-x-0" : "-translate-x-full"} z-30`}>
      <button onClick={toggleSidebar} className="absolute top-4 right-4 text-red-500">✖</button>
      <h2 className="text-xl font-bold mb-4">Sidebar</h2>
      <button id="fetchWind" className="bg-blue-500 px-4 text-white font-bold py-2 rounded mt-2">Fetch Wind Data</button>
      <button id="clearWaypoints" className="bg-red-500 px-4 text-white font-bold py-2 rounded mt-2">Clear Waypoints</button>
    </div>
  );
}
