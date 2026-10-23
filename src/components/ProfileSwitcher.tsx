import React from 'react';
import { OptimizationMode, OptimizerSettings, HardwareSpecs } from '../types/optimizer';
import { Zap, ShieldCheck, BatteryCharging, Sliders, Cpu, Monitor, HardDrive, Wifi } from 'lucide-react';

interface Props {
  settings: OptimizerSettings;
  onChangeSettings: (newSettings: OptimizerSettings) => void;
  hardware: HardwareSpecs | null;
}

export const ProfileSwitcher: React.FC<Props> = ({
  settings,
  onChangeSettings,
  hardware,
}) => {
  const handleSelectMode = (mode: OptimizationMode) => {
    let updated: OptimizerSettings;

    if (mode === 'ultra') {
      updated = {
        ...settings,
        mode: 'ultra',
        targetFps: hardware ? Math.max(hardware.displayRefreshHz, 144) : 165,
        resolutionScale: 100,
        lowLatencyMode: true,
        antiAliasing: false,
        particleDensity: 2400,
        dynamicResolution: false,
        ramOptimization: true,
        backgroundThrottle: true,
        batterySaverActive: false,
        tdpWattLimit: 65,
        fanCurveProfile: 'turbo',
      };
    } else if (mode === 'balanced') {
      updated = {
        ...settings,
        mode: 'balanced',
        targetFps: hardware ? hardware.displayRefreshHz : 120,
        resolutionScale: 90,
        lowLatencyMode: true,
        antiAliasing: true,
        particleDensity: 1600,
        dynamicResolution: true,
        ramOptimization: true,
        backgroundThrottle: true,
        batterySaverActive: false,
        tdpWattLimit: 35,
        fanCurveProfile: 'balanced',
      };
    } else if (mode === 'battery') {
      updated = {
        ...settings,
        mode: 'battery',
        targetFps: 45,
        resolutionScale: 75,
        lowLatencyMode: false,
        antiAliasing: false,
        particleDensity: 600,
        dynamicResolution: true,
        ramOptimization: true,
        backgroundThrottle: true,
        batterySaverActive: true,
        tdpWattLimit: 15,
        fanCurveProfile: 'silent',
      };
    } else {
      updated = {
        ...settings,
        mode: 'custom',
      };
    }

    onChangeSettings(updated);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Hardware Snapshot Strip */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-400">Display:</span>
          <span className="font-mono font-semibold text-white">
            {hardware ? `${hardware.displayRefreshHz} Hz Native` : '144 Hz Active'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="text-slate-400">Processor:</span>
          <span className="font-mono font-semibold text-white">
            {hardware ? `${hardware.cpuCores} Logical Threads` : '8 Cores'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-400">GPU:</span>
          <span className="font-mono font-semibold text-white truncate max-w-[200px]" title={hardware?.gpuRenderer}>
            {hardware?.gpuRenderer || 'Vulkan / DirectX GPU'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <BatteryCharging className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-400">Battery:</span>
          <span className="font-mono font-semibold text-white">
            {hardware?.batterySupported
              ? `${hardware.batteryLevel}% (${hardware.batteryCharging ? 'Charging' : 'On Battery'})`
              : '85% (Battery Guard Active)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-slate-400">Net RTT:</span>
          <span className="font-mono font-semibold text-white">
            {hardware ? `${hardware.networkRttMs} ms` : '18 ms'}
          </span>
        </div>
      </div>

      {/* Preset Profiles Segmented Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Profile 1: Ultra Esports */}
        <button
          onClick={() => handleSelectMode('ultra')}
          className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
            settings.mode === 'ultra'
              ? 'bg-cyan-950/40 border-cyan-500/70 shadow-lg shadow-cyan-950/50'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Zap className="w-4 h-4" />
              </div>
              {settings.mode === 'ultra' && (
                <span className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase">Active</span>
              )}
            </div>
            <h3 className="font-display font-bold text-base text-white mb-1">Ultra Esports</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Uncapped frame pacing, 0-frame Reflex queue, and aggressive GPU priority for competitive shooters.
            </p>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <span>Max FPS</span>
            <span aria-hidden="true">·</span>
            <span>Lowest Latency</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400 font-mono">~5.2ms</span>
          </div>
        </button>

        {/* Profile 2: Balanced Pro */}
        <button
          onClick={() => handleSelectMode('balanced')}
          className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
            settings.mode === 'balanced'
              ? 'bg-blue-950/40 border-blue-500/70 shadow-lg shadow-blue-950/50'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              {settings.mode === 'balanced' && (
                <span className="text-[11px] font-bold text-blue-400 tracking-wider uppercase">Active</span>
              )}
            </div>
            <h3 className="font-display font-bold text-base text-white mb-1">Balanced Pro</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Locked to monitor refresh rate with dynamic resolution scaling for zero screen tear and stable thermals.
            </p>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <span>Stable Pacing</span>
            <span aria-hidden="true">·</span>
            <span>FXAA Smooth</span>
            <span aria-hidden="true">·</span>
            <span className="text-blue-400 font-mono">144 FPS</span>
          </div>
        </button>

        {/* Profile 3: Battery Guardian */}
        <button
          onClick={() => handleSelectMode('battery')}
          className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
            settings.mode === 'battery'
              ? 'bg-emerald-950/40 border-emerald-500/70 shadow-lg shadow-emerald-950/50'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <BatteryCharging className="w-4 h-4" />
              </div>
              {settings.mode === 'battery' && (
                <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase">Active</span>
              )}
            </div>
            <h3 className="font-display font-bold text-base text-white mb-1">Battery Guardian</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              45 FPS Steam Deck cadence, 15W TDP ceiling, and background CPU parking. Extends battery by up to 2.5×.
            </p>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <span>+2.8h Playtime</span>
            <span aria-hidden="true">·</span>
            <span>Cool & Quiet</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono">14.2W</span>
          </div>
        </button>

        {/* Profile 4: Custom Studio */}
        <button
          onClick={() => handleSelectMode('custom')}
          className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
            settings.mode === 'custom'
              ? 'bg-purple-950/40 border-purple-500/70 shadow-lg shadow-purple-950/50'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sliders className="w-4 h-4" />
              </div>
              {settings.mode === 'custom' && (
                <span className="text-[11px] font-bold text-purple-400 tracking-wider uppercase">Active</span>
              )}
            </div>
            <h3 className="font-display font-bold text-base text-white mb-1">Custom Studio</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Granular access to resolution scale, thread allocation, Reflex low latency buffer, and TDP limits.
            </p>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <span>Full Control</span>
            <span aria-hidden="true">·</span>
            <span>Sliders</span>
            <span aria-hidden="true">·</span>
            <span className="text-purple-400 font-mono">User Defined</span>
          </div>
        </button>
      </div>

      {/* Custom Granular Controls Panel (Revealed when Custom mode is active, or toggleable) */}
      {settings.mode === 'custom' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Custom Optimization Parameters
            </h4>
            <span className="text-xs text-slate-400">Real-time hardware pipeline controls</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Control 1: Frame Rate Cap */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Target FPS Limit</span>
                <span className="font-mono text-cyan-400 font-bold tabular-nums">
                  {settings.targetFps > 0 ? `${settings.targetFps} FPS` : 'Unlimited'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[45, 60, 144, 0].map((fps) => (
                  <button
                    key={fps}
                    onClick={() => onChangeSettings({ ...settings, targetFps: fps })}
                    className={`px-2 py-1.5 text-xs rounded border transition-colors ${
                      settings.targetFps === fps
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {fps === 0 ? 'Uncap' : `${fps}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Control 2: Resolution Scale */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Internal Render Scale</span>
                <span className="font-mono text-cyan-400 font-bold tabular-nums">
                  {settings.resolutionScale}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="120"
                step="5"
                value={settings.resolutionScale}
                onChange={(e) => onChangeSettings({ ...settings, resolutionScale: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>50% (Speed)</span>
                <span>100% (Native)</span>
                <span>120% (Supersample)</span>
              </div>
            </div>

            {/* Control 3: TDP / Power Cap */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Power Envelope (TDP)</span>
                <span className="font-mono text-emerald-400 font-bold tabular-nums">
                  {settings.tdpWattLimit} W
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="65"
                step="5"
                value={settings.tdpWattLimit}
                onChange={(e) => onChangeSettings({ ...settings, tdpWattLimit: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>10W (Battery Save)</span>
                <span>35W (Standard)</span>
                <span>65W (Full Boost)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-800/80">
            {/* Toggle 1: Low Latency Reflex */}
            <label className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 cursor-pointer hover:border-slate-700">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Ultra-Low Latency Reflex</span>
                <span className="text-[11px] text-slate-400">Zero-frame queue for lowest mouse delay</span>
              </div>
              <input
                type="checkbox"
                checked={settings.lowLatencyMode}
                onChange={(e) => onChangeSettings({ ...settings, lowLatencyMode: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
              />
            </label>

            {/* Toggle 2: Anti-Aliasing */}
            <label className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 cursor-pointer hover:border-slate-700">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Edge Anti-Aliasing (FXAA)</span>
                <span className="text-[11px] text-slate-400">Smooth jagged edges on low resolutions</span>
              </div>
              <input
                type="checkbox"
                checked={settings.antiAliasing}
                onChange={(e) => onChangeSettings({ ...settings, antiAliasing: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
              />
            </label>

            {/* Toggle 3: Battery Saver Throttle */}
            <label className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 cursor-pointer hover:border-slate-700">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Battery Guardian Throttling</span>
                <span className="text-[11px] text-slate-400">Cap thermals & power consumption</span>
              </div>
              <input
                type="checkbox"
                checked={settings.batterySaverActive}
                onChange={(e) => onChangeSettings({ ...settings, batterySaverActive: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
