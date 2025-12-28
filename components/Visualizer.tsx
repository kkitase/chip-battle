
import React, { useState, useEffect } from 'react';
import { ProcessorType } from '../types';

interface VisualizerProps {
  type: ProcessorType;
}

const Visualizer: React.FC<VisualizerProps> = ({ type }) => {
  const [activeDots, setActiveDots] = useState<number[]>([]);
  const [pulse, setPulse] = useState(false);

  const handleClick = () => {
    setPulse(true);
    setTimeout(() => setPulse(false), 500);
    
    // Add burst effect
    const newDots = Array.from({ length: 8 }, () => Math.floor(Math.random() * 64));
    setActiveDots(prev => [...prev, ...newDots]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (type === ProcessorType.GPU) {
        // GPU: Parallel small vectors
        setActiveDots(prev => {
          const next = [...prev];
          if (next.length > 20) next.shift();
          next.push(Math.floor(Math.random() * 64));
          return next;
        });
      } else {
        // TPU: Massive matrix blocks
        setActiveDots(prev => {
          if (prev.length > 0) return [];
          return Array.from({ length: 64 }, (_, i) => i);
        });
      }
    }, type === ProcessorType.GPU ? 100 : 1000);

    return () => clearInterval(interval);
  }, [type]);

  return (
    <div 
      onClick={handleClick}
      className={`bg-slate-900 p-6 rounded-xl shadow-inner relative overflow-hidden transition-all cursor-pointer hover:ring-2 hover:ring-indigo-500/50 ${pulse ? 'scale-[1.02] ring-2 ring-indigo-400' : ''}`}
    >
      <div className="text-white mb-4 text-sm font-bold flex justify-between items-center">
        <span>{type} データフロー・イメージ <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded ml-2">Click me!</span></span>
        <span className="text-xs text-slate-400">
          {type === ProcessorType.GPU ? "細かな並列処理" : "巨大な一括演算"}
        </span>
      </div>
      <div className="grid grid-cols-8 gap-1 h-48 w-full place-items-center">
        {Array.from({ length: 64 }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-sm transition-all duration-300 ${
              activeDots.includes(i)
                ? (type === ProcessorType.GPU ? 'bg-indigo-400 scale-125 shadow-[0_0_8px_rgba(66,133,244,0.8)]' : 'bg-purple-400 scale-110 shadow-[0_0_12px_rgba(52,168,83,0.8)]')
                : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
      <div className="mt-4 text-xs text-slate-300 italic">
        {type === ProcessorType.GPU 
          ? "GPU: 数千個のコアがそれぞれ小さなベクトル計算を同時に実行します。" 
          : "TPU: 独自の回路（シストリック・アレイ）が巨大な行列をワンアクションで計算します。"}
      </div>
    </div>
  );
};

export default Visualizer;
