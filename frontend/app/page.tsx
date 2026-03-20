"use client";
import {useState} from "react";
export default function Home() {
  const [startNode, setStartNode] = useState<{ x: number; y: number, px: number, py: number} | null>(null);
  const [endNode, setEndNode] = useState<{ x: number; y: number, px: number, py: number} | null>(null);
  const [path, setPath] = useState<{px: number, py: number}[]>([]);
  const [algorithm, setAlgorithm] = useState<string>("Dijkstra");
  const [scale, setScale] = useState(1);
  const handleWheel = (e: React.WheelEvent) =>{
  e.preventDefault();
  const zoomStep= 0.1
  const newScale = e.deltaY > 0 ? Math.max(scale - zoomStep, 1) : Math.min(scale + zoomStep,5);
  setScale(newScale); 
};


  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    const pixelX = rawX / scale;
    const pixelY = rawY / scale;
    const gridX = Math.floor((pixelX / 800)*400);
    const gridY = Math.floor((pixelY / 600)*300);

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
    <main className="h-screen overflow-hidden p-6 bg-[#0b1120]/95 flex flex-row lg:flex-row gap-6 text-slate-200 font-sans relative">

      {/* <Map area /> */}
      <div className="relative w-[70%] h-full min-h-[500px] bg-[#080d1a] rounded-3xl overflow-auto scrollbar-hide border-2 border-cyan-400 shadow-[0_0_15px_2px_rgba(34,211,238,0.5)]" onWheel={handleWheel}>
        <div className="relative flex items-center justify-center h-full cursor-crosshair transition-transform duration-75 origin-top-left" style={{ transform: `scale(${scale})`, width:'100%', height:'100%' }} onClick={handleMapClick}>  
        <img src="/map.jpg" alt="Map" className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-80" />
        {startNode && (<div className="absolute w-4 h-4 bg-[#22c55e] border-2 border-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg z-10" style={{ left: startNode.px, top: startNode.py }}/>)}
        {endNode && (<div className="absolute w-4 h-4 bg-[#ef4444] border-2 border-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg z-10" style={{ left: endNode.px, top: endNode.py }}/>)}
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
    </div>

    {/* <Controls /> */}
    <div className="w-[30%] flex flex-col gap-4 h-full">

      <div className ="bg-[#0f172a] p-5 rounded-3xl border-2 border-cyan-400">
      <h2 style={{ fontFamily: "'Michroma', sans-serif" }} className="font-bold text-lg mb-4 text-cyan-400 uppercase tracking-widest border-b border-cyan-900 pb-2"> CONTROLS </h2>

        <ol style={{fontFamily: "'Barlow Condensed', sans-serif"}} className="text-sm space-y-1 mb-4 text-slate-400 list-decimal list-inside tracking-wide">
          <li>Click on the map to set START</li>
          <li>Click on the map again to set DESTINATION</li>
          <li>Choose an algorithm and run!</li>
        </ol>

        <div style={{fontFamily: "'Barlow Condensed', sans-serif"}} className="mb-4 p-3 bg-[#1e293b]/50 border-2 border-cyan-800 text-cyan-300 shadow-inner space-y-1 text-base tracking-wider uppercase rounded-xl">
          <p className="flex justify-between"><span className="opacity-70">START:</span> <span className="font-bold">{startNode ? `[${startNode.x}, ${startNode.y}]` : '-- : --'}</span></p>
          <p className="flex justify-between"><span className="opacity-70">DESTINATION:</span> <span className="font-bold">{endNode ? `[${endNode.x}, ${endNode.y}]` : '-- : --'}</span></p>
        </div>

        <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="font-bold text-sm mb-2 text-cyan-100/60 uppercase tracking-widest">Select Algorithm</h3>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setAlgorithm("Dijkstra")} style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${algorithm === "Dijkstra" ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.8)] scale-105" : "bg-[#0b1120] text-cyan-400 border border-cyan-600 border hover:bg-slate-50"}`}>Dijkstra's</button>
          <button onClick={() => setAlgorithm("A*")} style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${algorithm === "A*" ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.8)] scale-105" : "bg-[#0b1120] text-cyan-400 border border-cyan-600 border hover:bg-slate-50"}`}>A* Algorithm</button>
        </div>

        <div className="flex gap-2">
          <button onClick={runPathfinding} className="flex-2 bg-cyan-500 text-slate-950 py-2 px-6 rounded-lg text-sm font-medium flex items-center justify-center gap-2 w-full hover:bg-cyan-600 transition-colors">
            <span>▶</span> Run Algorithm
          </button>
          <button onClick={handleReset} className="flex-1 bg-[#1e293b] text-cyan-500 border border-cyan-800 py-2 px-4 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <span>⟳</span> Reset
          </button>
        </div>
      </div>
          {/* <Legend /> */}
      <div className="bg-[#0f172a] p-5 flex-1 rounded-3xl border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] overflow-hidden">
        <h2 style={{ fontFamily: "'Michroma', sans-serif" }} className="font-bold text-lg mb-4 text-cyan-400 uppercase tracking-widest border-b border-cyan-900 pb-2"> MAP LEGEND </h2>
            
        <h3 style={{fontFamily:"'Barlow Condensed', sans-serif"}} className="font-bold text-sm mb-2 text-cyan-100/60 uppercase tracking-widest">Terrain Costs</h3>
        <ul style={{fontFamily: "'Barlow Condensed', sans-serif"}} className="text-lg space-y-1 mb-4 text-slate-300">
          <li className="flex justify-between border-b border-cyan-900/30 pb-1"> <span>Grass</span> <span className="text-cyan-400 font-bold">1</span></li>
          <li className="flex justify-between border-b border-cyan-900/30 pb-1"> <span>Forest</span> <span className="text-cyan-400 font-bold">2</span></li>
          <li className="flex justify-between border-b border-cyan-900/30 pb-1"> <span>Desert</span> <span className="text-cyan-400 font-bold">3</span></li>
          <li className="flex justify-between border-b border-cyan-900/30 pb-1"> <span>Mountain</span> <span className="text-cyan-400 font-bold">5</span></li>
          <li className="flex justify-between border-b border-cyan-900/30 pb-1"> <span>Water</span> <span className="text-cyan-400 font-bold">10</span></li>
        </ul>


        <h3 style={{fontFamily:"'Barlow Condensed', sans-serif"}} className="font-bold text-sm mb-4 text-cyan-100/60 uppercase tracking-widest">Path States</h3>
        <ul style={{fontFamily: "'Barlow Condensed', sans-serif"}} className="text-lg space-y-3">
          <li className="flex items-center gap-3 text-slate-200 uppercase tracking-wider"> <span className="w-3 h-3 bg-[#22c55e] rounded-full shadow-[0_0_8px_#22c55e]"/>Start</li>
          <li className="flex items-center gap-3 text-slate-200 uppercase tracking-wider"> <span className="w-3 h-3 bg-[#ef4444] rounded-full shadow-[0_0_8px_#ef4444]"/>Destination</li>
          <li className="flex items-center gap-3 text-slate-200 uppercase tracking-wider"> <span className="w-3 h-3 bg-[#06b6d4] rounded-full shadow-[0_0_8px_#06b6d4]"/>Visited</li>
          <li className="flex items-center gap-3 text-slate-200 uppercase tracking-wider"><span className="w-3 h-3 bg-[#a855f7] rounded-full shadow-[0_0_8px_#a855f7]"/>Obstacle</li>
        </ul>
      </div>
    </div>
  </main>
  );
}