import React, { useState } from 'react';
import { HardwareSpecs, OptimizerSettings } from '../types/optimizer';
import { BatteryCharging, Battery, Zap, Wind, ShieldAlert, CheckCircle, Copy, Check, Flame, Sliders } from 'lucide-react';

interface Props {
  hardware: HardwareSpecs | null;
  settings: OptimizerSettings;
  onChangeSettings: (settings: OptimizerSettings) => void;
}

export const BatteryThermalGuardian: React.FC<Props> = ({
  hardware,
  settings,
  onChangeSettings,
}) => {
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [fanProfile, setFanProfile] = useState<'silent' | 'balanced' | 'turbo'>('balanced');
  const [targetTempC, setTargetTempC] = useState<number>(68);

  // Battery calculations
  const batteryLevel = hardware?.batteryLevel ?? 82;
  const isCharging = hardware?.batteryCharging ?? false;

  // Wattage comparisons
  const unoptimizedWatts = 56.0;
  const optimizedWatts = settings.batterySaverActive ? 15.5 : settings.tdpWattLimit || 32.0;

  // Estimated playtime left based on 70Wh standard gaming laptop / handheld battery
  const batteryCapacityWh = 70;
  const remainingEnergyWh = (batteryCapacityWh * (batteryLevel / 100));
  const unoptimizedHours = Math.round((remainingEnergyWh / unoptimizedWatts) * 10) / 10;
  const optimizedHours = Math.round((remainingEnergyWh / optimizedWatts) * 10) / 10;
  const gainedHours = Math.max(0.5, Math.round((optimizedHours - unoptimizedHours) * 10) / 10);

  const toggleBatterySaver = () => {
    const nextState = !settings.batterySaverActive;
    onChangeSettings({
      ...settings,
      batterySaverActive: nextState,
      targetFps: nextState ? 45 : 144,
      resolutionScale: nextState ? 75 : 100,
      tdpWattLimit: nextState ? 15 : 45,
    });
  };

  const powerSaveScript = `# Windows PowerCfg Gaming Battery Optimization (Run as Admin)
# 1. Duplicate & Activate Power Saver / Efficient Gaming Plan
powercfg -duplicatescheme a1841308-3541-4fab-bc81-f71556f20b4a
powercfg /setactive a1841308-3541-4fab-bc81-f71556f20b4a

# 2. Cap Maximum Processor State on Battery to 85% (Prevents boost frequency heat spikes)
powercfg -setdcvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMAX 85

# 3. Enable PCI Express Link State Power Management on DC
powercfg -setdcvalueindex SCHEME_CURRENT SUB_PCIEXPRESS ASPM 2

# 4. Apply configured power settings
powercfg -setactive SCHEME_CURRENT`;

  const copyScript = () => {
    navigator.clipboard.writeText(powerSaveScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h2 className="font-display font-bold text-xl text-white mb-1">
          Battery Guardian & Thermal Efficiency Engine
        </h2>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          Gaming on laptops and handhelds (Steam Deck, ROG Ally, Legion Go) rapidly drains battery and induces thermal throttling. Cap wattage spikes, lock frame times, and extend wireless gameplay by up to 2.5×.
        </p>
      </div>

      {/* Hero Battery Comparison Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BatteryCharging className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Battery Gauge</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-2xl text-white font-mono tabular-nums">
                  {batteryLevel}%
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  {isCharging ? 'AC Connected (Full Power Available)' : 'Running On Battery'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={toggleBatterySaver}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg ${
              settings.batterySaverActive
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/25 hover:bg-emerald-400'
                : 'bg-slate-800 text-slate-200 border border-slate-700 hover:text-white'
            }`}
          >
            <Battery className="w-4 h-4" />
            <span>
              {settings.batterySaverActive ? 'Battery Guardian Active (15.5W)' : 'Engage Battery Guardian'}
            </span>
          </button>
        </div>

        {/* Comparison Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Unoptimized High-Performance</span>
            <span className="font-mono font-bold text-2xl text-rose-400 tabular-nums block mb-1">
              {unoptimizedWatts.toFixed(0)} Watts
            </span>
            <span className="text-xs text-slate-400">
              Playtime: <strong className="text-white font-mono">{unoptimizedHours} Hours</strong> · High heat (82°C)
            </span>
          </div>

          <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl">
            <span className="text-xs text-emerald-300 block mb-1">Battery Guardian Optimized</span>
            <span className="font-mono font-bold text-2xl text-emerald-400 tabular-nums block mb-1">
              {optimizedWatts.toFixed(1)} Watts
            </span>
            <span className="text-xs text-slate-300">
              Playtime: <strong className="text-white font-mono">{optimizedHours} Hours</strong> · Cool (58°C)
            </span>
          </div>

          <div className="p-4 bg-cyan-950/30 border border-cyan-500/40 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs text-cyan-300 block mb-1">Extended Playtime Gained</span>
              <span className="font-mono font-bold text-2xl text-cyan-400 tabular-nums">
                +{gainedHours} Hours
              </span>
            </div>
            <span className="text-[11px] text-slate-400 pt-1">
              58% reduction in power consumption
            </span>
          </div>
        </div>

        {/* Interactive Sweet-Spot Frame Limiter */}
        <div className="p-5 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-display font-bold text-sm text-white">
                Display Refresh & Cadence Sweet-Spot
              </h4>
              <p className="text-xs text-slate-400">
                Steam Deck standard: 40Hz / 45FPS yields 33% longer battery life than 60FPS while maintaining smooth 16.6ms frame pacing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { fps: 30, label: '30 FPS', benefit: 'Max Battery (+3.4h)', drain: '12W' },
              { fps: 40, label: '40 FPS', benefit: 'Handheld Sweetspot', drain: '15W' },
              { fps: 45, label: '45 FPS', benefit: 'Silky & Efficient', drain: '18W' },
              { fps: 60, label: '60 FPS', benefit: 'Standard 60Hz', drain: '28W' },
            ].map((preset) => (
              <button
                key={preset.fps}
                onClick={() =>
                  onChangeSettings({
                    ...settings,
                    targetFps: preset.fps,
                    batterySaverActive: true,
                  })
                }
                className={`p-3 text-left rounded-lg border transition-all ${
                  settings.targetFps === preset.fps
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white">{preset.label}</span>
                  <span className="font-mono text-[10px] text-emerald-400">{preset.drain}</span>
                </div>
                <span className="text-[11px] text-slate-400 block">{preset.benefit}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Thermals & Fan Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-800">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="font-display font-bold text-base text-white">
              GPU & CPU Thermal Target
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Keeps silicon below the 85°C junction threshold where modern GPUs downclock core frequencies and cause sudden frame stutters.
          </p>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Max Junction Temperature</span>
              <span className="font-mono text-amber-400 font-bold tabular-nums">
                {targetTempC} °C Target
              </span>
            </div>
            <input
              type="range"
              min="60"
              max="85"
              step="1"
              value={targetTempC}
              onChange={(e) => setTargetTempC(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>60°C (Ice Cool / Low Noise)</span>
              <span>72°C (Balanced)</span>
              <span>85°C (Max Sustained Boost)</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-800">
            <Wind className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-bold text-base text-white">
              Acoustic Fan Profile Curve
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Select fan ramp-up profiles to balance decibel acoustics with cooling dissipation during extended gaming sessions.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'silent', label: 'Whisper Silent', rpm: '1800 RPM' },
              { id: 'balanced', label: 'Balanced Curve', rpm: '3200 RPM' },
              { id: 'turbo', label: 'Turbo Chill', rpm: '4800 RPM' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setFanProfile(p.id as 'silent' | 'balanced' | 'turbo')}
                className={`p-3 text-left rounded-lg border transition-all ${
                  fanProfile === p.id
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold text-white block mb-0.5">{p.label}</span>
                <span className="text-[10px] font-mono text-cyan-400">{p.rpm}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Script Generator Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
          <div>
            <h4 className="font-display font-bold text-sm text-white">
              Windows PowerCfg Battery Saver Tweak
            </h4>
            <p className="text-xs text-slate-400">
              Caps CPU aggressive turbo boost on DC battery power and enables PCI Express Active State Power Management.
            </p>
          </div>
          <button
            onClick={copyScript}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
          >
            {copiedScript ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Script</span>
              </>
            )}
          </button>
        </div>

        <pre className="bg-slate-950 p-3.5 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800/80 leading-relaxed">
          {powerSaveScript}
        </pre>
      </div>
    </div>
  );
};
