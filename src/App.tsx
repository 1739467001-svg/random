import React, { useState, useEffect, useRef } from 'react';
import { Settings, Play, RotateCcw, Trophy, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export default function App() {
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [count, setCount] = useState<number>(1);
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(false);
  const [guaranteedStr, setGuaranteedStr] = useState<string>('');
  const [excludedStr, setExcludedStr] = useState<string>('');
  
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [results, setResults] = useState<number[]>([]);
  const [displayNumbers, setDisplayNumbers] = useState<number[]>([]);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Parse comma-separated strings to number arrays
  const parseNumbers = (str: string): number[] => {
    return str
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
  };

  const handleDraw = () => {
    if (min >= max) {
      alert('最小值必须小于最大值 (Min must be less than Max)');
      return;
    }
    if (count < 1) {
      alert('抽取数量必须大于0 (Count must be greater than 0)');
      return;
    }

    const guaranteed = parseNumbers(guaranteedStr);
    const excluded = parseNumbers(excludedStr);

    let pool: number[] = [];
    for (let i = min; i <= max; i++) {
      if (!excluded.includes(i)) {
        pool.push(i);
      }
    }

    if (!allowDuplicates && pool.length < count - guaranteed.length) {
      alert('可用数字不足，请调整范围或允许重复 (Not enough numbers in pool)');
      return;
    }

    setIsDrawing(true);
    setResults([]);
    setDisplayNumbers(Array(count).fill(min));

    // Generate final results
    let finalResults: number[] = [...guaranteed];
    
    // Remove guaranteed from pool if no duplicates allowed
    if (!allowDuplicates) {
      pool = pool.filter(n => !guaranteed.includes(n));
    }

    const needed = count - finalResults.length;
    for (let i = 0; i < needed; i++) {
      if (pool.length === 0) break; // Should be caught by earlier check, but just in case
      const randomIndex = Math.floor(Math.random() * pool.length);
      finalResults.push(pool[randomIndex]);
      if (!allowDuplicates) {
        pool.splice(randomIndex, 1);
      }
    }

    // Shuffle final results
    for (let i = finalResults.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [finalResults[i], finalResults[j]] = [finalResults[j], finalResults[i]];
    }

    // Animation loop
    let iterations = 0;
    const maxIterations = 40; // 40 frames of animation for a longer, cooler effect
    const interval = setInterval(() => {
      setDisplayNumbers(prev => 
        prev.map((_, idx) => {
          // Stop animating numbers one by one
          if (iterations > maxIterations - (count - idx) * 4) {
            return finalResults[idx] || min;
          }
          return Math.floor(Math.random() * (max - min + 1)) + min;
        })
      );

      iterations++;
      if (iterations > maxIterations) {
        clearInterval(interval);
        setResults(finalResults);
        setDisplayNumbers(finalResults);
        setIsDrawing(false);
        
        // Epic confetti
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#6366f1', '#a855f7', '#ec4899']
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#6366f1', '#a855f7', '#ec4899']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      }
    }, 50);
  };

  const handleReset = () => {
    setResults([]);
    setDisplayNumbers([]);
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col">
      {/* Cool Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] opacity-50 mix-blend-screen"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-[100px] opacity-50 mix-blend-screen animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/5 border border-white/10 rounded-2xl text-indigo-400 backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
            LUCKY DRAW
          </h1>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full transition-all backdrop-blur-md group"
          title="设置 (Settings)"
        >
          <Settings className="w-6 h-6 text-zinc-400 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
        </button>
      </header>

      {/* Main Draw Area - Centered */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        
        <div className="w-full max-w-7xl flex flex-wrap justify-center items-center gap-8 mb-16">
          <AnimatePresence mode="popLayout">
            {displayNumbers.length > 0 ? (
              displayNumbers.map((num, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0, opacity: 0, rotateX: 90 }}
                  animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                  exit={{ scale: 0, opacity: 0, rotateX: -90 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 20,
                    delay: idx * 0.05
                  }}
                  className="relative group perspective-1000"
                >
                  {/* Glow effect behind the card */}
                  <div className={`absolute -inset-4 bg-gradient-to-r ${results.length > 0 ? 'from-indigo-500 via-purple-500 to-pink-500' : 'from-indigo-500/50 to-purple-500/50'} blur-2xl rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-500`}></div>
                  
                  {/* The Card */}
                  <div className="relative w-40 h-56 sm:w-56 sm:h-72 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] flex items-center justify-center shadow-2xl overflow-hidden transform-gpu transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-2">
                    {/* Glass reflections */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none"></div>
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                    
                    <span className="text-7xl sm:text-9xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                      {num}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-zinc-500 text-xl flex flex-col items-center gap-6"
              >
                <div className="w-32 h-32 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                  <Trophy className="w-12 h-12 text-zinc-400" />
                </div>
                <p className="tracking-widest uppercase text-sm font-semibold text-zinc-400">Ready to Draw</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={handleDraw}
            disabled={isDrawing}
            className="group relative px-12 py-5 bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-full font-bold text-xl transition-all active:scale-95 flex items-center gap-4 overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.3)] disabled:shadow-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <Play className={`w-6 h-6 ${isDrawing ? 'animate-pulse' : ''}`} fill="currentColor" />
            {isDrawing ? 'DRAWING...' : 'START DRAW'}
          </button>
          
          {results.length > 0 && !isDrawing && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleReset}
              className="p-5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-full transition-all active:scale-95 backdrop-blur-md"
              title="重置 (Reset)"
            >
              <RotateCcw className="w-6 h-6" />
            </motion.button>
          )}
        </div>
      </main>

      {/* Settings Overlay Drawer */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-zinc-950 border-l border-white/10 z-50 overflow-y-auto shadow-2xl"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Settings className="w-6 h-6 text-indigo-400" />
                    控制面板
                  </h2>
                  <button 
                    onClick={() => setShowSettings(false)} 
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-10">
                  {/* Basic Settings */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-8 h-px bg-indigo-500/50"></span>
                      基础设置
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-400">最小值 (Min)</label>
                        <input
                          type="number"
                          value={min}
                          onChange={(e) => setMin(Number(e.target.value))}
                          className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-lg"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-400">最大值 (Max)</label>
                        <input
                          type="number"
                          value={max}
                          onChange={(e) => setMax(Number(e.target.value))}
                          className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-zinc-400">抽取数量 (Count)</label>
                      <input
                        type="number"
                        min="1"
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-lg"
                      />
                    </div>

                    <label className="flex items-center justify-between cursor-pointer group p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                      <span className="text-base font-medium text-zinc-300 group-hover:text-white transition-colors">允许重复中奖</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={allowDuplicates}
                          onChange={(e) => setAllowDuplicates(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-12 h-7 rounded-full transition-colors ${allowDuplicates ? 'bg-indigo-500' : 'bg-zinc-800'}`}></div>
                        <div className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white transition-transform shadow-md ${allowDuplicates ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </div>
                    </label>
                  </div>

                  {/* Advanced Settings */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-fuchsia-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-8 h-px bg-fuchsia-500/50"></span>
                      高级控制 (暗箱)
                    </h3>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-zinc-400 flex justify-between items-end">
                        <span>必中名单 (Guaranteed)</span>
                        <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded">逗号分隔</span>
                      </label>
                      <input
                        type="text"
                        placeholder="例如: 8, 88"
                        value={guaranteedStr}
                        onChange={(e) => setGuaranteedStr(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all font-mono text-base placeholder:text-zinc-700"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-zinc-400 flex justify-between items-end">
                        <span>排除名单 (Excluded)</span>
                        <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded">逗号分隔</span>
                      </label>
                      <input
                        type="text"
                        placeholder="例如: 4, 14"
                        value={excludedStr}
                        onChange={(e) => setExcludedStr(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all font-mono text-base placeholder:text-zinc-700"
                      />
                    </div>
                  </div>
                  
                  <div className="p-5 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-2xl">
                    <p className="text-sm text-fuchsia-300/80 leading-relaxed">
                      <strong className="text-fuchsia-300 block mb-1">💡 暗箱提示：</strong>
                      必中名单中的数字将优先被抽出，并随机混入最终结果中。排除名单中的数字绝对不会被抽出。
                    </p>
                  </div>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

