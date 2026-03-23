"use client";
import {useState} from "react";
import {useRef} from "react";
export default function Home() {
  const [startNode, setStartNode] = useState<{ x: number; y: number, px: number, py: number} | null>(null);
  const [endNode, setEndNode] = useState<{ x: number; y: number, px: number, py: number} | null>(null);
  const [path, setPath] = useState<{px: number, py: number}[]>([]);
  const [algorithm, setAlgorithm] = useState<string>("Dijkstra");
  const [scale, setScale] = useState(1);
  const [position,setPosition] = useState({x:0,y:0});
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement |null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const drawIntervalRef = useRef<NodeJS.Timeout | null>(null);
const [dijkstraStats, setDijkstraStats] = useState<{ time: number; length: number } | null>(null);
const [aStarStats, setAStarStats] = useState<{ time: number; length: number } | null>(null);
  const GRID_WIDTH = 400;
  const GRID_HEIGHT = 300;

  const mapRef = useRef<HTMLDivElement | null>(null);

  const handleRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if(endNode){
      new Audio('/remove.flac').play().catch(e => console.log(e));
      setEndNode(null);
      setPath([]);
    } else if(startNode){
      new Audio('/remove.flac').play().catch(e => console.log(e));
      setStartNode(null);
    }
  };


  const playClickSound = () => {
    const audio = new Audio('/click.mp3');
    audio.volume = 0.6
    audio.play().catch(e => console.log("Audio play error:", e));
  };

  const toggleMusic = () => {
    if(audioRef.current){
      if(isPlaying){
        audioRef.current.pause();
      }else{
        audioRef.current.volume =0.3;
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };


  const handleWheel = (e: React.WheelEvent) =>{
  e.preventDefault();

  const container = e.currentTarget;
  const rect = container.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const zoomStep= 0.1
  const newScale = e.deltaY > 0 ? Math.max(scale - zoomStep, 1) : Math.min(scale + zoomStep,5);
  if(newScale === scale) return;
  const scaleRatio = newScale / scale;
  const newPosX = mouseX - (mouseX - position.x) * scaleRatio;
  const newPosY = mouseY - (mouseY - position.y) * scaleRatio;
  const maxX=0;
  const maxY=0;
  const minX = rect.width * (1 - newScale);
  const minY = rect.height * (1 - newScale);
  setScale(newScale); 
  setPosition({
    x: Math.min(maxX, Math.max(minX, newPosX)),
    y: Math.min(maxY, Math.max(minY, newPosY))
  });
};


  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    const pixelX = (rawX-position.x) / scale;
    const pixelY = (rawY-position.y) / scale;
    const mapWidth = rect.width;
    const mapHeight = rect.height;
    const rawGridX = Math.floor((pixelX / mapWidth) * GRID_WIDTH);
    const rawGridY = Math.floor((pixelY / mapHeight) * GRID_HEIGHT);
    const gridX = Math.max(0, Math.min(399, rawGridX));
    const gridY = Math.max(0, Math.min(299, rawGridY));

    if(!startNode) {
      new Audio('/sensor.flac').play().catch(e => console.log(e));
      setStartNode({ x: gridX, y: gridY, px: pixelX, py: pixelY });
    } else if(!endNode) {
      new Audio('/sensor.flac').play().catch(e => console.log(e));
      setEndNode({ x: gridX, y: gridY, px: pixelX, py: pixelY });
    }
  };

  const handleReset = () => {
    playClickSound();
    if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
    setStartNode(null);
    setEndNode(null);
    setPath([]);
    setDijkstraStats(null);
    setAStarStats(null);
  }
// Send data to backend API
  const runPathfinding = async () => {
    playClickSound();
    if(!startNode || !endNode){
      alert("Please set both start and end points first!");
      return;
    }

    setIsCalculating(true);
    console.log("Sending data to API...");

    try{
      const startTime = performance.now();
      const response = await fetch('/api/pathfind',{ method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ startNode, endNode, algorithm })});
      const data = await response.json();
      const elapsed = performance.now() - startTime;

      if(data.success){
        if(algorithm === "Dijkstra"){
          setDijkstraStats({ time: Math.round(elapsed), length: data.path.length });
        } else {
          setAStarStats({ time: Math.round(elapsed), length: data.path.length });
        }
        console.log("Received path from API:", data.path);
        const fullPath = data.path;
        setPath([]);
        if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
        new Audio('/sensorpath.flac').play().catch(e => console.log(e));

        let i = 0;
        drawIntervalRef.current = setInterval(() => {
          if (i >= fullPath.length - 1) {
            clearInterval(drawIntervalRef.current!);
            new Audio('/FoundPath.flac').play().catch(e => console.log(e));
            return;
          }
          setPath(prevPath => [...prevPath, fullPath[i]]);
          i++;
        }, 30); 
      }
    }catch(error){
      console.error("Error calling API:", error);
    } finally{
      setIsCalculating(false);
    }
  };

  const mapWidth =  mapRef.current?.clientWidth ?? 1;
  const mapHeight = mapRef.current?.clientHeight ?? 1;

  const pathPoints = path
      .map(
          p =>
              `${((p.px + 0.5) / 400) * mapWidth},${((p.py + 0.5) / 300) * mapHeight}`
      )
      .join(" ");

  return (
    <main className="h-screen p-6 bg-[#0b1120]/95 flex flex-row lg:flex-row gap-6 text-slate-200 relative">


      <audio ref={audioRef} src="/Song of Storms.mp3" loop />
      {/* <Map area /> */}
      <div ref={mapRef} className="relative w-[70%] h-full min-h-[500px] bg-[#080d1a] rounded-3xl overflow-hidden scrollbar-hide border-2 border-cyan-400 shadow-[0_0_15px_2px_rgba(34,211,238,0.5)] cursor-crosshair" onWheel={handleWheel} onClick={handleMapClick} onContextMenu={handleRightClick}>
        <div className="relative h-full w-full" style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transformOrigin: '0 0',willChange: 'transform'}}>  
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
          <polyline points={pathPoints} fill="none" stroke="#22d3ee" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter="url(#Draw)" className="draw-path opacity-90"/>
          {/* Glow*/}
          <polyline points={pathPoints} fill="none" stroke="#a5f3fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#Glow)" className="glow-path opacity-80"/>
        </svg>
        )}
      </div>
    </div>

    {/* <Controls /> */}
    <div className="w-[30%] flex flex-col gap-4 overflow-y-auto scrollbar-hide">

      <div className ="bg-[#0b1320] backdrop-blur-md p-5 rounded-3xl border border-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
      <div className="flex justify-between items-center mb-4 border-b border-cyan-700/50 pb-2">
      <h2  className="font-bold text-lg text-cyan-300 uppercase tracking-widest"> CONTROLS </h2>
      <div className="flex items-center gap-2">
      <button onClick={toggleMusic} className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center shadow-lg flex-shrink-0 ${ isPlaying ? "border-green-400/50 text-green-400 shadow-[0_0_10px_#22c55e]" : "border-cyan-600/50 text-cyan-400 hover:bg-cyan-900/30"}`}>
      <span className ="text-lg">{isPlaying ? "🔊" : "🔇"}</span>
      </button>
      <input type="range" min="0" max="1" step="0.01" defaultValue="0.3" onChange={(e)=> { if(audioRef.current) audioRef.current.volume = parseFloat(e.target.value);}} className="w-20 accent-cyan-400 opacity-60 hover:opacity-100 transition-opacity"/>{}
      </div>
      </div>

        <ol  className="text-sm space-y-1 mb-4 text-cyan-100/70 list-decimal list-inside tracking-wide">
          <li>Click on the map to set START</li>
          <li>Click on the map again to set DESTINATION</li>
          <li>Right Click to remove last point</li>
          <li>Choose an algorithm and run!</li>
        </ol>

        <div  className="mb-4 p-3 bg-[#060b14]/60 border border-cyan-800/50 text-cyan-300 shadow-inner space-y-1 text-base tracking-wider uppercase rounded-xl">
          <p className="flex justify-between"><span className="opacity-70">START:</span> <span className="font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{startNode ? `[${startNode.x}, ${startNode.y}]` : '-- : --'}</span></p>
          <p className="flex justify-between"><span className="opacity-70">DESTINATION:</span> <span className="font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{endNode ? `[${endNode.x}, ${endNode.y}]` : '-- : --'}</span></p>
        </div>

        <h3 className="font-bold text-sm mb-2 text-cyan-100/60 uppercase tracking-widest">Select Algorithm</h3>

        <div className="flex gap-2 mb-4">
          <button onClick={() => { playClickSound(); setAlgorithm("Dijkstra")}} className={`flex-1 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${algorithm === "Dijkstra" ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.8)] scale-105" : "bg-transparent text-cyan-400 border border-cyan-600/50 border hover:bg-cyan-900/30"}`}>Dijkstra's</button>
          <button onClick={() => { playClickSound(); setAlgorithm("A*")}} className={`flex-1 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${algorithm === "A*" ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.8)] scale-105" : "bg-transparent text-cyan-400 border border-cyan-600/50 border hover:bg-cyan-900/30"}`}>A*</button>
        </div>

        <div className="flex gap-2">
          <button onClick={runPathfinding}
          disabled = {isCalculating}
           className={`flex-[2] py-2 px-6 rounded-full text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 w-full transition-all ${isCalculating ? "bg-cyan-900 text-cyan-400 opacity-70 cursor-not-allowed border border-cyan-700 shadow-none" : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"}`}>
          {isCalculating ? (<><span className="animate-pulse">⏳</span> Calculating...</>) : (<><span>▶</span> Run Algorithm</>)}
          </button>
          <button onClick={handleReset} className="flex-1 bg-[#1e293b] text-cyan-500 border border-cyan-800 py-2 px-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-cyan-900/30 transition-colors flex items-center justify-center gap-2">
            <span>⟳</span> Reset
          </button>
        </div>
      </div>
          {/* <Legend /> */}
      <div className="flex flex-col gap-4">

        {/* <Middle Box /> */}
      <div className="bg-[#0b1320]/70 backdrop-blur-md p-4 rounded-3xl border border-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
        <h2 className="font-bold text-lg mb-3 text-cyan-300 uppercase tracking-widest border-b border-cyan-700 pb-2"> MAP LEGEND </h2>
            
        <h3 className="font-bold text-sm mb-2 text-cyan-100/50 uppercase tracking-widest">Terrain Costs</h3>
        <ul className="text-base space-y-1 mb-6 text-slate-300">
          <li className="flex justify-between border-b border-cyan-900/40 pb-1"> <span>Grass</span> <span className="text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]">1</span></li>
          <li className="flex justify-between border-b border-cyan-900/40 pb-1"> <span>Forest</span> <span className="text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]">2</span></li>
          <li className="flex justify-between border-b border-cyan-900/40 pb-1"> <span>Desert</span> <span className="text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]">3</span></li>
          <li className="flex justify-between border-b border-cyan-900/40 pb-1"> <span>Mountain</span> <span className="text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]">5</span></li>
          <li className="flex justify-between border-b border-cyan-900/40 pb-1"> <span>Water</span> <span className="text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]">10</span></li>
        </ul>

        <h3 className="font-bold text-sm mb-3 text-cyan-300 uppercase tracking-widest border-b border-cyan-700 pb-2">Path States</h3>
        <div className="flex gap-3">
          <span className="flex items-center gap-2 border-b border-cyan-900/40 pb-1"> <span className="w-3 h-3 bg-[#22c55e] rounded-full shadow-[0_0_8px_#22c55e]"/>Start</span>
          <span className="flex items-center gap-2 border-b border-cyan-900/40 pb-1"> <span className="w-3 h-3 bg-[#ef4444] rounded-full shadow-[0_0_8px_#ef4444]"/>Destination</span>
          <span className="flex items-center gap-2 border-b border-cyan-900/40 pb-1"> <span className="w-3 h-3 bg-[#06b6d4] rounded-full shadow-[0_0_8px_#06b6d4]"/>Calculated Path</span>
        </div>
      </div>

        <div className="bg-[#0b1320]/70 backdrop-blur-md p-3 rounded-3xl border border-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
        <h2 className="font-bold text-lg mb-3 text-cyan-300 uppercase tracking-widest border-b border-cyan-700 pb-2"> PATH ANALYSIS </h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cyan-700 pb-1">
              <th className="text-left text-cyan-100/40 font-bold uppercase tracking-widest pb-2 text-xs"></th>
              <th className="text-center text-cyan-400 font-bold uppercase tracking-widest pb-2 text-xs">Dijkstra</th>
              <th className="text-center text-cyan-400 font-bold uppercase tracking-widest pb-2 text-xs">A*</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-cyan-900/40">
            <td className="opacity-60 py-2">Time</td>
            <td className="text-cyan-400 font-bold text-center">{dijkstraStats ? `${dijkstraStats.time} ms` : '--'}</td>
            <td className="text-cyan-400 font-bold text-center">{aStarStats ? `${aStarStats.time} ms` : '--'}</td>
            </tr>
            <tr className="border-b border-cyan-900/40">
            <td className="opacity-60 py-2">Path Nodes</td>
            <td className="text-cyan-400 font-bold text-center">{dijkstraStats ? dijkstraStats.length : '--'}</td>
            <td className="text-cyan-400 font-bold text-center">{aStarStats ? aStarStats.length : '--'}</td>
            </tr>
          </tbody>
        </table>
          {!dijkstraStats && !aStarStats && <p className="text-xs text-cyan-100/30 italic mt-2">Run an algorithm to see path analysis here</p>}
        </div>
      </div>
    </div>
  </main>
  );
}