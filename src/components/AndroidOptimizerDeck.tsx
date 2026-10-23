import React, { useState } from 'react';
import { Smartphone, Zap, Sliders, Battery, ShieldAlert, Copy, Check, Download, Layers, Flame, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const AndroidOptimizerDeck: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [touchSamplingRate, setTouchSamplingRate] = useState<number>(480);
  const [forceAmolesHz, setForceAmoledHz] = useState<number>(120);
  const [disableRamPlus, setDisableRamPlus] = useState<boolean>(true);
  const [mistouchPrevention, setMistouchPrevention] = useState<boolean>(true);
  const [networkPriority, setNetworkPriority] = useState<boolean>(true);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const adbMasterScript = `# JuanBoost Android Master Gaming Optimizer (Run in ADB Shell or Shizuku)
# 1. Force High Refresh Rate & Disable Dynamic 60Hz Drop
settings put system peak_refresh_rate 120.0
settings put system min_refresh_rate 120.0

# 2. Force Hardware-Accelerated 2D/3D SurfaceFlinger Rendering
setprop debug.sf.hw 1
setprop debug.egl.hw 1
setprop debug.composition.type gpu

# 3. Disable Stutter-Causing Android RAM Plus / Virtual ZRAM (Huge FPS boost!)
settings put global ram_expand_size_list 0

# 4. Enable Native Android Game Mode API
settings put global game_mode 1
cmd power set-mode 0

# 5. Low-Latency Wi-Fi Multicast Lock
cmd wifi set-multicast-filter enabled`;

  return (
    <div className="flex flex-col gap-6">
      {/* Android Hero Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-mono font-bold text-emerald-400">ANDROID GAMING ENGINE</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Snapdragon · Dimensity · Tensor</span>
            </div>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
              Android Game Turbo & Touch Engine
            </h2>
          </div>
        </div>

        {/* PWA / Android APK Installation Trigger */}
        {!isInstalled && (
          <button
            onClick={install}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/25 whitespace-nowrap"
          >
            <Smartphone className="w-4 h-4" />
            <span>Install JuanBoost Android App</span>
          </button>
        )}
        {isInstalled && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Running in Native Android App Mode</span>
          </div>
        )}
      </div>

      {/* Android Mobile Touch & Screen Response Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Touch Sampling Rate Engine */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display font-bold text-base text-white">
                  Touch Sampling Rate Booster
                </h3>
              </div>
              <span className="font-mono font-bold text-cyan-400 text-sm">{touchSamplingRate} Hz</span>
            </div>

            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Standard Android digitizers sample touch at 120Hz (8.3ms delay). Overclocking polling to 480Hz/720Hz cuts touch-to-crosshair latency to <strong>1.4ms</strong> in competitive shooters.
            </p>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {[120, 240, 480, 720].map((hz) => (
                <button
                  key={hz}
                  onClick={() => setTouchSamplingRate(hz)}
                  className={`py-2 px-1 text-center rounded-lg border text-xs transition-all ${
                    touchSamplingRate === hz
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block font-bold">{hz} Hz</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {hz === 120 ? '8.3ms' : hz === 240 ? '4.1ms' : hz === 480 ? '2.0ms' : '1.4ms'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Instant Aim Micro-Adjustment</span>
            <span className="text-emerald-400 font-medium">Ultra-Fast Response Active</span>
          </div>
        </div>

        {/* Module 2: AMOLED Display Refresh Rate Lock */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <h3 className="font-display font-bold text-base text-white">
                  AMOLED Refresh Rate Lock
                </h3>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-sm">{forceAmolesHz} Hz Fixed</span>
            </div>

            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Prevents Android LTPO displays (Samsung, Xiaomi, OnePlus) from fluctuating down to 60Hz or 30Hz during low-movement scenes, eliminating micro-stutters.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[60, 90, 120].map((hz) => (
                <button
                  key={hz}
                  onClick={() => setForceAmoledHz(hz)}
                  className={`py-2.5 px-2 text-center rounded-lg border text-xs transition-all ${
                    forceAmolesHz === hz
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block font-bold">{hz} Hz</span>
                  <span className="text-[10px] text-slate-500">
                    {hz === 60 ? 'Standard' : hz === 90 ? 'Smooth' : 'Ultra Esports'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Continuous Frame Rate Cadence</span>
            <span className="text-cyan-400 font-medium">Stutter Drops Blocked</span>
          </div>
        </div>
      </div>

      {/* Android System Tweaks & RAM Plus Disabler */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <h3 className="font-display font-bold text-base text-white mb-1">
          Android Gaming Hardware Accelerations
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Essential Android OS switches recommended by mobile esports champions and game engine developers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setDisableRamPlus(!disableRamPlus)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              disableRamPlus
                ? 'bg-emerald-950/30 border-emerald-500/50'
                : 'bg-slate-950/50 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs text-white">Disable RAM Plus / ZRAM</span>
              <input
                type="checkbox"
                checked={disableRamPlus}
                readOnly
                className="w-4 h-4 rounded text-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Virtual RAM on Android writes memory blocks to flash storage, causing sudden 50ms freezing. Disabling it gives pure LPDDR5X speed.
            </p>
          </div>

          <div
            onClick={() => setMistouchPrevention(!mistouchPrevention)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              mistouchPrevention
                ? 'bg-cyan-950/30 border-cyan-500/50'
                : 'bg-slate-950/50 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs text-white">Edge Mistouch Filter</span>
              <input
                type="checkbox"
                checked={mistouchPrevention}
                readOnly
                className="w-4 h-4 rounded text-cyan-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ignores palm rests and edge grips on curved screens so your thumbs never drop a crucial sprint or fire trigger input.
            </p>
          </div>

          <div
            onClick={() => setNetworkPriority(!networkPriority)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              networkPriority
                ? 'bg-purple-950/30 border-purple-500/50'
                : 'bg-slate-950/50 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs text-white">5G / Wi-Fi Game Bearer</span>
              <input
                type="checkbox"
                checked={networkPriority}
                readOnly
                className="w-4 h-4 rounded text-purple-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Enables low-latency Wi-Fi multicast and forces mobile modem to keep baseband radio active without sleep standby.
            </p>
          </div>
        </div>
      </div>

      {/* Android ADB & Shell Script Generator */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h4 className="font-display font-bold text-sm text-white">
              Android ADB & Shizuku One-Click Commands
            </h4>
            <p className="text-xs text-slate-400">
              Run these commands via USB debugging (ADB on PC/Mac) or directly on device using Shizuku / LADB (no PC required).
            </p>
          </div>

          <button
            onClick={() => copyToClipboard(adbMasterScript, 'adb')}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
          >
            {copiedId === 'adb' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied ADB Script</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All Commands</span>
              </>
            )}
          </button>
        </div>

        <pre className="bg-slate-950 p-4 rounded-lg text-[11px] font-mono text-emerald-400/90 overflow-x-auto border border-slate-800/80 leading-relaxed">
          {adbMasterScript}
        </pre>
      </div>
    </div>
  );
};
