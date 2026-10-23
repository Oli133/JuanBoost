import React, { useState } from 'react';
import { performMemoryPurge } from '../utils/hardwareProbe';
import { HardwareSpecs } from '../types/optimizer';
import { HardDrive, Trash2, Cpu, Check, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';

interface Props {
  hardware: HardwareSpecs | null;
}

interface BackgroundApp {
  id: string;
  name: string;
  ramUsageMB: number;
  cpuDrainPercent: number;
  isSilenced: boolean;
  recommendation: string;
}

export const ResourceCleaner: React.FC<Props> = ({ hardware }) => {
  const totalSystemRAM = hardware ? hardware.deviceMemoryGB * 1024 : 16384;
  const [usedRAM, setUsedRAM] = useState<number>(7820);
  const [standbyRAM, setStandbyRAM] = useState<number>(3150);
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [purgeSuccess, setPurgeSuccess] = useState<string | null>(null);

  const [backgroundApps, setBackgroundApps] = useState<BackgroundApp[]>([
    {
      id: 'browser_tabs',
      name: 'Browser Background Tabs & Cache',
      ramUsageMB: 1140,
      cpuDrainPercent: 4.2,
      isSilenced: true,
      recommendation: 'Suspend inactive background tabs',
    },
    {
      id: 'discord',
      name: 'Discord / Communication App Overlay',
      ramUsageMB: 480,
      cpuDrainPercent: 2.1,
      isSilenced: true,
      recommendation: 'Disable hardware acceleration hook',
    },
    {
      id: 'cloud_sync',
      name: 'Cloud Drive Sync (OneDrive / Dropbox)',
      ramUsageMB: 290,
      cpuDrainPercent: 3.8,
      isSilenced: true,
      recommendation: 'Pause background indexing while gaming',
    },
    {
      id: 'antivirus_scan',
      name: 'Real-Time File Scanning Service',
      ramUsageMB: 360,
      cpuDrainPercent: 5.5,
      isSilenced: false,
      recommendation: 'Add Game Directory to scan exclusion list',
    },
    {
      id: 'stream_encoder',
      name: 'OBS / Shadowplay Pre-buffer Cache',
      ramUsageMB: 650,
      cpuDrainPercent: 2.4,
      isSilenced: false,
      recommendation: 'Use dedicated NVENC / AMF GPU ASIC chip',
    },
  ]);

  const handlePurgeMemory = async () => {
    setIsPurging(true);
    setPurgeSuccess(null);

    const result = await performMemoryPurge();

    setUsedRAM((prev) => Math.max(3200, prev - result.freedMB));
    setStandbyRAM(result.standbyRemainingMB);
    setIsPurging(false);
    setPurgeSuccess(`Purged Standby List! Successfully freed ${result.freedMB} MB RAM back to system pool.`);

    setTimeout(() => {
      setPurgeSuccess(null);
    }, 4000);
  };

  const toggleSilenceApp = (id: string) => {
    setBackgroundApps((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const nextState = !app.isSilenced;
          if (nextState) {
            setUsedRAM((r) => Math.max(3000, r - Math.round(app.ramUsageMB * 0.4)));
          } else {
            setUsedRAM((r) => r + Math.round(app.ramUsageMB * 0.4));
          }
          return { ...app, isSilenced: nextState };
        }
        return app;
      })
    );
  };

  const freeRAM = totalSystemRAM - usedRAM - standbyRAM;
  const usedPercent = Math.round((usedRAM / totalSystemRAM) * 100);
  const standbyPercent = Math.round((standbyRAM / totalSystemRAM) * 100);
  const freePercent = Math.round((freeRAM / totalSystemRAM) * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Overview */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h2 className="font-display font-bold text-xl text-white mb-1">
          System RAM & Hardware Resource Allocator
        </h2>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          Aggressive memory optimization prevents stutter spikes caused by Windows Standby Memory leaks, pagefile swapping, and background CPU thread contention.
        </p>
      </div>

      {/* Main RAM Bar & Cleaner Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block mb-1">Total System Memory</span>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-black text-2xl text-white font-mono tabular-nums">
                {(totalSystemRAM / 1024).toFixed(0)} GB
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({usedRAM} MB In Use · {standbyRAM} MB Standby Cache · {freeRAM} MB Free)
              </span>
            </div>
          </div>

          <button
            onClick={handlePurgeMemory}
            disabled={isPurging}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-lg shadow-cyan-500/20 whitespace-nowrap"
          >
            {isPurging ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Flushing Standby Cache...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 fill-current" />
                <span>Purge Standby RAM & Free Buffers</span>
              </>
            )}
          </button>
        </div>

        {/* Visual Memory Strip */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
            <div
              style={{ width: `${usedPercent}%` }}
              className="h-full bg-cyan-500 rounded-l-full transition-all duration-500"
              title={`Used: ${usedPercent}%`}
            />
            <div
              style={{ width: `${standbyPercent}%` }}
              className="h-full bg-amber-500/80 transition-all duration-500"
              title={`Standby Cache: ${standbyPercent}%`}
            />
            <div
              style={{ width: `${freePercent}%` }}
              className="h-full bg-emerald-500/60 rounded-r-full transition-all duration-500"
              title={`Free: ${freePercent}%`}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
                <span>Active Process RAM ({usedPercent}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-amber-500/80" />
                <span>Standby Cached Files ({standbyPercent}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60" />
                <span>Free Pool ({freePercent}%)</span>
              </div>
            </div>
            <span className="font-mono text-slate-400">{freeRAM} MB Available</span>
          </div>
        </div>

        {/* Purge Notification */}
        {purgeSuccess && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex items-center gap-2.5 text-xs text-emerald-300 mb-5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{purgeSuccess}</span>
          </div>
        )}

        {/* Technical Explainer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
          <div>
            <span className="font-semibold text-white block mb-1">Standby Memory Flush</span>
            <p className="text-slate-400 leading-relaxed">
              Windows caches closed programs in Standby memory. In games with high texture loads, this triggers micro-stutters when allocating memory.
            </p>
          </div>
          <div>
            <span className="font-semibold text-white block mb-1">Pagefile Thrash Elimination</span>
            <p className="text-slate-400 leading-relaxed">
              By keeping at least 3GB of clean uncommitted RAM free, the game executable never gets paged to the slower SSD/HDD swap file.
            </p>
          </div>
          <div>
            <span className="font-semibold text-white block mb-1">CPU Affinity Pinning</span>
            <p className="text-slate-400 leading-relaxed">
              Locks the primary game rendering loop exclusively to high-frequency Performance cores, isolating audio and discord to Efficiency cores.
            </p>
          </div>
        </div>
      </div>

      {/* Background Apps Silencer List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-display font-bold text-base text-white">
              Background Process Throttle & Priority Shield
            </h3>
            <p className="text-xs text-slate-400">
              Silence or deprioritize non-essential applications while games are running to free up CPU cores and GPU encoding engines.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {backgroundApps.map((app) => (
            <div
              key={app.id}
              className={`p-3.5 rounded-lg border transition-all flex flex-wrap items-center justify-between gap-4 ${
                app.isSilenced
                  ? 'bg-slate-950/80 border-slate-800'
                  : 'bg-slate-900/40 border-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    app.isSilenced
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-800 border border-slate-700 text-slate-400'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-xs text-white block">{app.name}</span>
                  <span className="text-[11px] text-slate-400">{app.recommendation}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs font-mono font-semibold text-slate-300 block tabular-nums">
                    {app.ramUsageMB} MB
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {app.cpuDrainPercent}% CPU
                  </span>
                </div>

                <button
                  onClick={() => toggleSilenceApp(app.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                    app.isSilenced
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {app.isSilenced ? 'Priority Silenced' : 'Active (Click to Throttle)'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
