"use client";
import {useState} from "react";
export default function Home() {
  const [startNode, setStartNode] = useState<{ x: number; y: number, px: number, py: number} | null>(null);
  const [endNode, setEndNode] = useState<{ x: number; y: number, px: number, py: number} | null>(null);
  const [path, setPath] = useState<{px: number, py: number}[]>([]);
  const [algorithm, setAlgorithm] = useState<string>("Dijkstra");

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;
    const gridX = Math.floor((pixelX / rect.width)*400);
    const gridY = Math.floor((pixelY / rect.height)*300);

    if(!startNode) {
      setStartNode({ x: gridX, y: gridY, px: pixelX, py: pixelY });
    } else if(!endNode) {
      setEndNode({ x: gridX, y: gridY, px: pixelX, py: pixelY });
    }
  };

  const handleReset = () => {
    setStartNode(null);
    setEndNode(null);
    setPath([]);
  }
// Send data to backend API
  const runPathfinding = async () => {
    if(!startNode || !endNode){
      alert("Please set both start and end points first!");
      return;
    }

    console.log("Sending data to API...");
    try{
      const response = await fetch('/api/pathfind', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startNode: startNode,endNode: endNode, algorithm: algorithm 
        })
      });

      const data = await response.json();
      if(data.success){
        console.log("Received path from API:", data.path);
        setPath(data.path);
      }
    }catch(error){
      console.error("Error calling API:", error);
    }
  };

  return (
    <main className="min-h-screen p-6 bg-[#fbfbf9] flex flex-col lg:flex-row gap-6 text-slate-800 font-sans">

      {/* <Map area /> */}
      <div className="relative w-full lg:w-[70%] bg-[#1a1a1a] rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex items-center justify-center min-h-[700px] cursor-crosshair" onClick={handleMapClick}>
        <img src="/map.jpg" alt="Zelda Map" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
        {startNode && (<div className="absolute w-4 h-4 bg-[#22c55e] border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg z-10" style={{ left: startNode.px, top: startNode.py }}/>)}
        {endNode && (<div className="absolute w-4 h-4 bg-[#ef4444] border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg z-10" style={{ left: endNode.px, top: endNode.py }}/>)}
        {/* Draw shieka path :D*/}
        {path.length>0 &&(
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">

          <defs>
          {/* Neon color*/}
          <filter id="Glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
            </filter>

            <filter id="Draw" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="1" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.0" xChannelSelector="R" yChannelSelector="G"/>
            </filter>
          </defs>
          {/* Texture*/}
          <polyline points={path.map(p => `${p.px},${p.py}`).join(' ')} fill="none" stroke="#22d3ee" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter="url(#Draw)" className="draw-path opacity-90"/>
          {/* Glow*/}
          <polyline points={path.map(p => `${p.px},${p.py}`).join(' ')} fill="none" stroke="#a5f3fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#Glow)" className="glow-path opacity-80"/>
        </svg>
        )}
      </div>

    {/* <Controls /> */}
    <div className="w-full lg:w-[30%] flex flex-col gap-6">

      <div className ="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="font-bold text-xl mb-4 text-black">Controls</h2>
        <ol className="text-sm space-y-2 mb-6 text-slate-600 list-decimal list-inside">
          <li>Click on the map to set starting point</li>
          <li>Click on the map again to set destination</li>
          <li>Choose an algorithm and run!</li>
        </ol>

        <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-mono text-slate-600 space-y-1">
          <p>Start: {startNode ? `${startNode.x}, ${startNode.y}` : 'Not set'}</p>
          <p>End: {endNode ? `${endNode.x}, ${endNode.y}` : 'Not set'}</p>
        </div>

        <h3 className="font-semibold text-sm mb-3 text-black">Select Algorithm</h3>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setAlgorithm("Dijkstra")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${algorithm === "Dijkstra" ? "bg-black text-white" : "bg-white text-black border border-slate-300 hover:bg-slate-50"}`}>Dijkstra's</button>
          <button onClick={() => setAlgorithm("A*")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${algorithm === "A*" ? "bg-black text-white" : "bg-white text-black border border-slate-300 hover:bg-slate-50"}`}>A* Algorithm</button>
        </div>

        <div className="flex gap-2">
          <button onClick={runPathfinding} className="flex-2 bg-black text-white py-2 px-6 rounded-lg text-sm font-medium flex items-center justify-center gap-2 w-full hover:bg-slate-800 transition-colors">
            <span>▶</span> Run Algorithm
          </button>
          <button onClick={handleReset} className="flex-1 bg-white text-black border border-slate-300 py-2 px-4 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <span>⟳</span> Reset
          </button>
        </div>
      </div>
          {/* <Legend /> */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="font-bold text-xl mb-4 text-black">Map Legend</h2>
            
        <h3 className="font-semibold text-sm mb-2 text-black">Terrain Costs</h3>
        <ul className="text-sm space-y-1 mb-6 text-slate-600">
           <li>Grass: 1</li>
          <li>Forest: 2</li>
          <li>Desert: 3</li>
          <li>Mountain: 5</li>
          <li>Water: 10</li>
        </ul>

        <h3 className="font-semibold text-sm mb-2 text-black">Path States</h3>
        <ul className="text-sm space-y-3 text-slate-600">
          <li className="flex items-center gap-3"><span className="w-5 h-5 bg-[#22c55e] rounded border border-black/10"></span> Start</li>
          <li className="flex items-center gap-3"><span className="w-5 h-5 bg-[#ef4444] rounded border border-black/10"></span> Destination</li>
          <li className="flex items-center gap-3"><span className="w-5 h-5 bg-[#06b6d4] rounded border border-black/10"></span> Visited</li>
          <li className="flex items-center gap-3"><span className="w-5 h-5 bg-[#a855f7] rounded border border-black/10"></span> Obstacle</li>
        </ul>
      </div>
    </div>
  </main>
  );
}