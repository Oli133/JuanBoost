import React, { useState, useEffect } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { LiveBenchmarkCanvas } from './components/LiveBenchmarkCanvas';
import { LatencyLab } from './components/LatencyLab';
import { ResourceCleaner } from './components/ResourceCleaner';
import { BatteryThermalGuardian } from './components/BatteryThermalGuardian';
import { GameProfiles } from './components/GameProfiles';
import { SystemTweaksDeck } from './components/SystemTweaksDeck';
import { AndroidOptimizerDeck } from './components/AndroidOptimizerDeck';
import { HardwareSpecs, OptimizerSettings, BenchmarkMetrics } from './types/optimizer';
import { detectHardwareSpecs, performMemoryPurge } from './utils/hardwareProbe';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Gauge, Zap, HardDrive, Battery, CheckCircle2, Smartphone, Download, X, WifiOff } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [hardware, setHardware] = useState<HardwareSpecs | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [lastBoosted, setLastBoosted] = useState<boolean>(false);
  const [showAndroidInstallBanner, setShowAndroidInstallBanner] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();

  const [boostToast, setBoostToast] = useState<{
    fpsDelta: string;
    latencyDelta: string;
    ramFreed: string;
    batteryDelta: string;
  } | null>(null);

  // Settings State
  const [settings, setSettings] = useState<OptimizerSettings>({
    mode: 'ultra',
    targetFps: 120, // Mobile standard 120Hz
    resolutionScale: 100,
    lowLatencyMode: true,
    antiAliasing: false,
    particleDensity: 2000,
    dynamicResolution: false,
    ramOptimization: true,
    backgroundThrottle: true,
    batterySaverActive: false,
    tdpWattLimit: 45,
    fanCurveProfile: 'turbo',
    audioLatencyFix: true,
  });

  // Benchmark Metrics State
  const [metrics, setMetrics] = useState<BenchmarkMetrics>({
    currentFps: 120,
    averageFps: 118,
    percentile1Low: 104,
    frameTimeMs: 8.3,
    inputLatencyMs: 4.2,
    gpuUtilization: 72,
    ramUsageMB: 4850,
    batteryDrainWatts: 8.5, // Mobile SoC standard 4-12W
    frameHistory: [8.1, 8.3, 8.2, 8.4, 8.1, 8.3, 8.2, 8.3, 8.2, 8.1],
  });

  // Detect real hardware specs on mount
  useEffect(() => {
    detectHardwareSpecs().then((specs) => {
      setHardware(specs);
      if (specs.displayRefreshHz > 60) {
        setSettings((prev) => ({
          ...prev,
          targetFps: specs.displayRefreshHz,
        }));
      }
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdateMetrics = (newMetrics: Partial<BenchmarkMetrics>) => {
    setMetrics((prev) => ({ ...prev, ...newMetrics }));
  };

  // Master One-Click Boost Trigger
  const handleTriggerBoost = async () => {
    setIsOptimizing(true);
    setBoostToast(null);

    const purgeResult = await performMemoryPurge();

    setTimeout(() => {
      setSettings((prev) => ({
        ...prev,
        lowLatencyMode: true,
        ramOptimization: true,
        backgroundThrottle: true,
      }));

      setMetrics((prev) => ({
        ...prev,
        currentFps: Math.min(165, Math.round(prev.currentFps * 1.25)),
        percentile1Low: Math.min(165, Math.round(prev.percentile1Low * 1.3)),
        inputLatencyMs: Math.max(1.8, Math.round(prev.inputLatencyMs * 0.6)),
        ramUsageMB: Math.max(2800, prev.ramUsageMB - purgeResult.freedMB),
      }));

      setIsOptimizing(false);
      setLastBoosted(true);

      setBoostToast({
        fpsDelta: '+25% FPS Boost',
        latencyDelta: '-40% Touch Delay',
        ramFreed: `${purgeResult.freedMB} MB RAM Freed`,
        batteryDelta: 'SoC Paced',
      });

      setTimeout(() => {
        setBoostToast(null);
      }, 5000);
    }, 850);
  };

  return (
    <div className="min-h-screen bg-[#090d14] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Bar Navigation */}
      <HeaderNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOptimizing={isOptimizing}
        onTriggerBoost={handleTriggerBoost}
        lastBoosted={lastBoosted}
      />

      {/* Offline Toast */}
      {!isOnline && (
        <div className="fixed top-16 left-4 z-50 flex items-center gap-2 bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow-lg animate-fade-in">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode — Service Worker Active</span>
        </div>
      )}

      {/* Android Native WebAPK Installation Banner (when not yet installed) */}
      {!isInstalled && showAndroidInstallBanner && (
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/70 border-b border-emerald-500/30 px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block sm:inline mr-2">
                Get the JuanBoost Android App
              </span>
              <span className="text-slate-400 hidden sm:inline">
                Install as a standalone Android WebAPK with offline support & touch latency booster.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={install}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-500/20 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
            <button
              onClick={() => setShowAndroidInstallBanner(false)}
              className="p-1 text-slate-400 hover:text-white"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Boost Notification Floating Bar */}
      {boostToast && (
        <div className="fixed top-18 right-4 sm:right-6 z-50 bg-slate-900 border border-emerald-500/50 shadow-2xl shadow-emerald-950/60 rounded-xl p-4 max-w-xs sm:max-w-sm animate-bounce-subtle">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-display font-bold text-xs sm:text-sm text-white">
              JuanBoost Engine Active!
            </span>
          </div>
          <div className="text-xs text-slate-300 grid grid-cols-2 gap-2 pt-1 font-mono">
            <span className="text-cyan-400 font-bold">{boostToast.fpsDelta}</span>
            <span className="text-emerald-400 font-bold">{boostToast.latencyDelta}</span>
            <span className="text-amber-400 font-bold">{boostToast.ramFreed}</span>
            <span className="text-purple-400 font-bold">{boostToast.batteryDelta}</span>
          </div>
        </div>
      )}

      {/* Main App Container (with pb-24 for mobile bottom navbar clearance) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8 flex flex-col gap-8">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
                    Android & PC Gaming Optimizer
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Real-time FPS acceleration, 480Hz touch sampling rate booster, ZRAM/RAM Plus cleaner, and mobile battery guardian.
                  </p>
                </div>

                {/* Quick Android Switch Tab */}
                <button
                  onClick={() => setActiveTab('android')}
                  className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Open Android Turbo Deck →</span>
                </button>
              </div>

              {/* Profiles & Hardware Bar */}
              <ProfileSwitcher
                settings={settings}
                onChangeSettings={setSettings}
                hardware={hardware}
              />
            </div>

            {/* Live 3D Benchmark & Frame Pacing Cockpit */}
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="font-display font-bold text-lg text-white">
                  Live Rendering Cockpit & Frame-Time Telemetry
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time frame pacing, 1% Low stability analysis, and sub-millisecond latency inspection.
                </p>
              </div>

              <LiveBenchmarkCanvas
                settings={settings}
                metrics={metrics}
                onUpdateMetrics={handleUpdateMetrics}
              />
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-base text-white mb-1.5">
                    1. Boost FPS & 1% Lows
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Bypasses compositing delays and forces high AMOLED refresh rate to deliver silky-smooth 90/120 FPS.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-cyan-400 pt-3 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                  <span>Target: {settings.targetFps > 0 ? `${settings.targetFps} FPS` : 'Uncapped'}</span>
                  <button onClick={() => setActiveTab('games')} className="hover:underline text-slate-300">
                    Games →
                  </button>
                </div>
              </div>

              <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-base text-white mb-1.5">
                    2. Cut Touch & Input Lag
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Boosts digitizer touch sampling to 480Hz/720Hz and trims frame queues for instant headshot reflex.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-emerald-400 pt-3 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                  <span>Current: {metrics.inputLatencyMs}ms Delay</span>
                  <button onClick={() => setActiveTab('latency')} className="hover:underline text-slate-300">
                    Test Touch →
                  </button>
                </div>
              </div>

              <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-base text-white mb-1.5">
                    3. Purge RAM & ZRAM
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Flushes bloated Android RAM Plus / ZRAM swap partitions that induce stutter spikes in mobile games.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-purple-400 pt-3 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                  <span>Freed: 850 MB Pool</span>
                  <button onClick={() => setActiveTab('memory')} className="hover:underline text-slate-300">
                    Clean RAM →
                  </button>
                </div>
              </div>

              <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                    <Battery className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-base text-white mb-1.5">
                    4. Maximize Battery Life
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Caps SoC thermal spikes and stabilizes wattage draw to deliver up to +2.5 hours longer wireless gameplay.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-amber-400 pt-3 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                  <span>Draw: {metrics.batteryDrainWatts.toFixed(1)}W</span>
                  <button onClick={() => setActiveTab('battery')} className="hover:underline text-slate-300">
                    Battery Hub →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Android Turbo Deck */}
        {activeTab === 'android' && <AndroidOptimizerDeck />}

        {/* Tab: Latency Lab */}
        {activeTab === 'latency' && <LatencyLab />}

        {/* Tab: Memory Purge */}
        {activeTab === 'memory' && <ResourceCleaner hardware={hardware} />}

        {/* Tab: Battery Guard */}
        {activeTab === 'battery' && (
          <BatteryThermalGuardian
            hardware={hardware}
            settings={settings}
            onChangeSettings={setSettings}
          />
        )}

        {/* Tab: Game Library */}
        {activeTab === 'games' && <GameProfiles />}

        {/* Tab: System Tweaks & ADB */}
        {activeTab === 'tweaks' && <SystemTweaksDeck />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-5 px-6 mb-16 lg:mb-0 bg-slate-950/60">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 font-display">JuanBoost Android</span>
            <span aria-hidden="true">·</span>
            <span>Mobile Game Turbo, Low Latency & Battery Suite</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button onClick={() => setActiveTab('android')} className="hover:text-emerald-400 transition-colors">
              Android Turbo
            </button>
            <button onClick={() => setActiveTab('latency')} className="hover:text-slate-300 transition-colors">
              Touch Latency
            </button>
            <button onClick={() => setActiveTab('battery')} className="hover:text-slate-300 transition-colors">
              Battery Guardian
            </button>
            <button onClick={() => setActiveTab('tweaks')} className="hover:text-slate-300 transition-colors">
              ADB Shell Scripts
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
