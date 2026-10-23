import React, { useEffect, useRef, useState } from 'react';
import { OptimizerSettings, BenchmarkMetrics } from '../types/optimizer';
import { Play, Pause, RefreshCw, Cpu, Gauge, Zap, Battery, Sparkles } from 'lucide-react';

interface Props {
  settings: OptimizerSettings;
  metrics: BenchmarkMetrics;
  onUpdateMetrics: (newMetrics: Partial<BenchmarkMetrics>) => void;
}

type SceneType = 'cyber' | 'highway' | 'space';

export const LiveBenchmarkCanvas: React.FC<Props> = ({
  settings,
  metrics,
  onUpdateMetrics,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const graphCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeScene, setActiveScene] = useState<SceneType>('cyber');
  const [artificialStutter, setArtificialStutter] = useState<boolean>(false);

  // References for animation loop state
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const frameTimesRef = useRef<number[]>([]);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(performance.now());

  // Particles state for canvas scene
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    z: number;
    speed: number;
    color: string;
    size: number;
  }>>([]);

  // Initialize particles
  useEffect(() => {
    const pCount = Math.min(settings.particleDensity, 3000);
    const newParticles = [];
    const colors = activeScene === 'cyber'
      ? ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']
      : activeScene === 'highway'
      ? ['#ef4444', '#f59e0b', '#38bdf8', '#ffffff']
      : ['#6366f1', '#a855f7', '#38bdf8', '#4ade80'];

    for (let i = 0; i < pCount; i++) {
      newParticles.push({
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1000,
        z: Math.random() * 1200 + 50,
        speed: (Math.random() * 2 + 1) * (activeScene === 'highway' ? 3.5 : 1.8),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 2.5 + 1,
      });
    }
    particlesRef.current = newParticles;
  }, [settings.particleDensity, activeScene]);

  // Main Render Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetFps = settings.batterySaverActive ? 45 : settings.targetFps;
    const frameIntervalMs = targetFps > 0 ? 1000 / targetFps : 0;

    let localFrameHistory: number[] = [...metrics.frameHistory];

    const render = (currentTime: number) => {
      const delta = currentTime - lastTimeRef.current;

      // Frame Rate Throttling if frame cap is active
      if (frameIntervalMs > 0 && delta < frameIntervalMs - 1.2) {
        animFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      lastTimeRef.current = currentTime;
      frameCountRef.current++;

      // Artificial stutter generator if test is toggled
      if (artificialStutter && Math.random() < 0.05) {
        const stutterBlock = performance.now();
        while (performance.now() - stutterBlock < 48) {
          // busy wait to simulate micro-stutter
        }
      }

      // Calculate instantaneous frame time
      const frameTimeMs = Math.max(1, delta);
      frameTimesRef.current.push(frameTimeMs);
      if (frameTimesRef.current.length > 90) {
        frameTimesRef.current.shift();
      }

      localFrameHistory.push(frameTimeMs);
      if (localFrameHistory.length > 60) {
        localFrameHistory.shift();
      }

      // Update metrics every 300ms
      if (currentTime - lastFpsUpdateRef.current >= 300) {
        const sortedTimes = [...frameTimesRef.current].sort((a, b) => b - a);
        const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        const currentFps = Math.min(240, Math.round(1000 / (avgFrameTime || 16)));
        
        // 99th percentile frame time = 1% Low FPS
        const p99Index = Math.floor(sortedTimes.length * 0.1);
        const p99FrameTime = sortedTimes[p99Index] || avgFrameTime;
        const percentile1Low = Math.min(currentFps, Math.max(15, Math.round(1000 / (p99FrameTime * 1.15))));

        // Latency simulation based on settings
        // Base display latency + reflex buffer queue + frame delta
        const reflexDeduction = settings.lowLatencyMode ? 14 : 0;
        const inputLatencyMs = Math.max(3.8, Math.round((frameTimeMs * 1.2 + 8.5) - reflexDeduction));

        // GPU load simulation
        const resolutionLoad = (settings.resolutionScale / 100) * 45;
        const particleLoad = (settings.particleDensity / 3000) * 35;
        const aaLoad = settings.antiAliasing ? 12 : 2;
        const gpuUtilization = Math.min(99, Math.round(resolutionLoad + particleLoad + aaLoad));

        // Battery drain simulation
        // When battery saver is active, drops down to 12-16W; unoptimized full throttle draws 45-60W
        let batteryWatts = 48.0;
        if (settings.batterySaverActive) {
          batteryWatts = 14.2;
        } else if (settings.mode === 'ultra') {
          batteryWatts = 56.5;
        } else if (settings.mode === 'balanced') {
          batteryWatts = 28.0;
        }

        onUpdateMetrics({
          currentFps,
          averageFps: currentFps,
          percentile1Low,
          frameTimeMs: Math.round(frameTimeMs * 10) / 10,
          inputLatencyMs,
          gpuUtilization,
          batteryDrainWatts: batteryWatts,
          frameHistory: [...localFrameHistory],
        });

        lastFpsUpdateRef.current = currentTime;
      }

      // Canvas Rendering based on resolution scaling
      const width = canvas.width;
      const height = canvas.height;
      const resScale = settings.resolutionScale / 100;

      // Draw background
      ctx.save();
      ctx.fillStyle = activeScene === 'cyber' ? '#070b12' : activeScene === 'highway' ? '#06080d' : '#04060a';
      ctx.fillRect(0, 0, width, height);

      // Draw Horizon Grid / Perspective
      ctx.lineWidth = 1;
      const horizonY = height * 0.58;
      ctx.strokeStyle = activeScene === 'cyber' ? 'rgba(6, 182, 212, 0.15)' : activeScene === 'highway' ? 'rgba(239, 68, 68, 0.18)' : 'rgba(99, 102, 241, 0.15)';

      // Perspective floor lines
      for (let x = -width; x < width * 2; x += 60) {
        ctx.beginPath();
        ctx.moveTo(width / 2, horizonY);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal floor lines moving with time
      const timeOffset = (currentTime * (activeScene === 'highway' ? 0.3 : 0.15)) % 40;
      for (let y = horizonY; y < height; y += 15 + (y - horizonY) * 0.25) {
        const renderY = y + timeOffset * ((y - horizonY) / height);
        if (renderY < height) {
          ctx.beginPath();
          ctx.moveTo(0, renderY);
          ctx.lineTo(width, renderY);
          ctx.stroke();
        }
      }

      // Update and draw 3D flying particle objects
      const pCount = Math.floor(settings.particleDensity * resScale);
      const particles = particlesRef.current;
      const cx = width / 2;
      const cy = height * 0.52;

      ctx.imageSmoothingEnabled = settings.antiAliasing;

      for (let i = 0; i < Math.min(pCount, particles.length); i++) {
        const p = particles[i];
        p.z -= p.speed * (settings.mode === 'ultra' ? 1.4 : 1.0);
        if (p.z <= 10) {
          p.z = 1200;
          p.x = (Math.random() - 0.5) * 1600;
          p.y = (Math.random() - 0.5) * 1000;
        }

        const k = 320 / p.z;
        const px = cx + p.x * k;
        const py = cy + p.y * k;
        const radius = Math.max(0.8, p.size * k);

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();

          // Render speed streaks if high performance
          if (k > 0.8 && activeScene === 'highway') {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = radius * 0.8;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px - (px - cx) * 0.08, py - (py - cy) * 0.08);
            ctx.stroke();
          }
        }
      }

      // Draw Center Reticle / Tactical Target
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 36, cy);
      ctx.lineTo(cx - 12, cy);
      ctx.moveTo(cx + 12, cy);
      ctx.lineTo(cx + 36, cy);
      ctx.moveTo(cx, cy - 36);
      ctx.lineTo(cx, cy - 12);
      ctx.moveTo(cx, cy + 12);
      ctx.lineTo(cx, cy + 36);
      ctx.stroke();

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, settings, activeScene, artificialStutter]);

  // Draw real-time frame time graph
  useEffect(() => {
    const canvas = graphCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const history = metrics.frameHistory;
    if (history.length < 2) return;

    const maxMs = 33.3; // 30 FPS boundary
    const targetMs = 1000 / (settings.targetFps || 144);
    const targetY = height - (targetMs / maxMs) * height;

    // Draw reference line for target frame time
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, Math.max(4, targetY));
    ctx.lineTo(width, Math.max(4, targetY));
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw frame history bars
    const barWidth = width / history.length;
    for (let i = 0; i < history.length; i++) {
      const ms = history[i];
      const barHeight = Math.min(height, (ms / maxMs) * height);
      const x = i * barWidth;
      const y = height - barHeight;

      // Color coding: green for smooth (<= 12ms), yellow for acceptable (<= 18ms), red for stutter (> 20ms)
      if (ms <= 12) {
        ctx.fillStyle = '#10b981'; // smooth emerald
      } else if (ms <= 18) {
        ctx.fillStyle = '#f59e0b'; // amber
      } else {
        ctx.fillStyle = '#ef4444'; // red stutter
      }

      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }
  }, [metrics.frameHistory, settings.targetFps]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Cockpit Header */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setActiveScene('cyber')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeScene === 'cyber'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cyber Assault
            </button>
            <button
              onClick={() => setActiveScene('highway')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeScene === 'highway'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Speed Horizon
            </button>
            <button
              onClick={() => setActiveScene('space')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeScene === 'space'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Orbital Dogfight
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setArtificialStutter(!artificialStutter)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
              artificialStutter
                ? 'bg-red-500/20 border-red-500/50 text-red-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Simulate unoptimized system micro-stutters to benchmark optimizer reaction"
          >
            {artificialStutter ? 'Stutter Active' : 'Test Micro-Stutter'}
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
            title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="relative w-full aspect-video sm:aspect-[21/9] bg-black overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={960}
          height={480}
          className="w-full h-full object-cover"
        />

        {/* Real-Time Live HUD Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-lg px-4 py-2 flex items-baseline gap-3">
            <span className="text-3xl font-display font-extrabold text-cyan-400 tabular-nums tracking-tight">
              {metrics.currentFps}
            </span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">FPS</span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-emerald-400 font-mono tabular-nums">
              1% Low: {metrics.percentile1Low} FPS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-md px-3 py-1.5 flex items-center gap-2">
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-xs text-slate-400">Frame Time</span>
              <span className="text-xs font-mono font-bold text-white tabular-nums">
                {metrics.frameTimeMs} ms
              </span>
            </div>

            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-md px-3 py-1.5 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-slate-400">Latency</span>
              <span className="text-xs font-mono font-bold text-amber-300 tabular-nums">
                {metrics.inputLatencyMs} ms
              </span>
            </div>

            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-md px-3 py-1.5 flex items-center gap-2">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-slate-400">Power</span>
              <span className="text-xs font-mono font-bold text-emerald-300 tabular-nums">
                {metrics.batteryDrainWatts.toFixed(1)} W
              </span>
            </div>
          </div>
        </div>

        {/* Live Active Profile Kicker */}
        <div className="absolute top-4 right-4 pointer-events-none">
          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="text-xs text-slate-400">Profile:</span>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              {settings.mode === 'ultra' ? 'Ultra Esports (Max FPS)' : settings.mode === 'balanced' ? 'Balanced Pro' : settings.mode === 'battery' ? 'Battery Guardian' : 'Custom'}
            </span>
          </div>
        </div>

        {/* Bottom Pacing History Graph */}
        <div className="absolute bottom-3 left-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-lg p-2.5 flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span>Frame Pacing History (60 Frames)</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400">Green = Smooth</span>
              <span className="text-amber-400">Yellow = Jitter</span>
              <span className="text-red-400">Red = Spike</span>
            </div>
            <span className="font-mono text-slate-400">Target: {settings.targetFps > 0 ? `${settings.targetFps} FPS` : 'Unlimited'}</span>
          </div>
          <canvas
            ref={graphCanvasRef}
            width={480}
            height={36}
            className="w-full h-9 rounded"
          />
        </div>
      </div>

      {/* Benchmark Summary Bar */}
      <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 block mb-0.5">GPU Compute Load</span>
          <span className="font-mono font-bold text-slate-200 tabular-nums text-sm">
            {metrics.gpuUtilization}%
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Render Scaling</span>
          <span className="font-mono font-bold text-cyan-400 tabular-nums text-sm">
            {settings.resolutionScale}% ({Math.round(1920 * (settings.resolutionScale / 100))}×{Math.round(1080 * (settings.resolutionScale / 100))})
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Reflex Queue Pacing</span>
          <span className={`font-mono font-bold tabular-nums text-sm ${settings.lowLatencyMode ? 'text-emerald-400' : 'text-slate-300'}`}>
            {settings.lowLatencyMode ? '0 Frames (Ultra Low)' : '2 Frames (Standard)'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Anti-Aliasing</span>
          <span className="font-mono font-bold text-slate-200 tabular-nums text-sm">
            {settings.antiAliasing ? 'FXAA Enabled' : 'Off (Max Speed)'}
          </span>
        </div>
      </div>
    </div>
  );
};
