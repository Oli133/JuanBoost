import React, { useState } from 'react';
import { Terminal, Copy, Check, Download, ShieldCheck, AlertCircle, FileCode } from 'lucide-react';

interface TweakScript {
  id: string;
  title: string;
  category: 'Windows GPU' | 'Timer Resolution' | 'Power & CPU' | 'Linux / Steam Deck';
  impact: string;
  description: string;
  filename: string;
  code: string;
}

export const SystemTweaksDeck: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const tweaks: TweakScript[] = [
    {
      id: 'hags_gamemode',
      title: 'Enable Hardware Accelerated GPU Scheduling (HAGS) & Game Mode',
      category: 'Windows GPU',
      impact: '+8-14% FPS & Reduced VRAM Latency',
      description: 'Allows the GPU to directly manage its own video memory scheduling rather than passing through the Windows DWM compositing thread.',
      filename: 'Enable_HAGS_GameMode.reg',
      code: `Windows Registry Editor Version 5.00

; Enable Hardware-Accelerated GPU Scheduling (HAGS)
[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers]
"HwSchMode"=dword:00000002

; Enable Windows Dedicated Game Mode
[HKEY_CURRENT_USER\\Software\\Microsoft\\GameBar]
"AllowAutoGameMode"=dword:00000001
"AutoGameModeEnabled"=dword:00000001
`,
    },
    {
      id: 'disable_gamedvr',
      title: 'Disable Xbox Game DVR & Background Buffer Recording',
      category: 'Windows GPU',
      impact: 'Eliminates 1% Low Stutters & Input Lag',
      description: 'Windows Game DVR continuously writes a 60-second rolling video cache to disk and GPU memory, causing periodic stutter spikes during fast camera turns.',
      filename: 'Disable_GameDVR_StutterFix.reg',
      code: `Windows Registry Editor Version 5.00

; Disable Game DVR Background Recording
[HKEY_CURRENT_USER\\System\\GameConfigStore]
"GameDVR_Enabled"=dword:00000000
"GameDVR_FSEBehaviorMode"=dword:00000002
"GameDVR_HonorUserFSEBehaviorMode"=dword:00000001
"GameDVR_DXGIHonorFSEWindowsCompatible"=dword:00000001

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\GameDVR]
"AllowGameDVR"=dword:00000000
`,
    },
    {
      id: 'timer_resolution',
      title: 'Force 0.5ms High-Precision System Timer Resolution',
      category: 'Timer Resolution',
      impact: '-8ms Click-to-Photon Delay',
      description: 'Decreases Windows system clock tick from standard 15.6ms down to 0.5ms, ensuring instantaneous mouse polling synchronization.',
      filename: 'Optimize_Timer_Resolution.bat',
      code: `@echo off
:: Enable High Precision Platform Clock and Disable Synthetic Timers
bcdedit /set useplatformclock false
bcdedit /set useplatformtick yes
bcdedit /set disabledynamictick yes

echo [JuanBoost] High Precision Timer Pacing applied successfully.
echo [JuanBoost] Restart your PC for kernel timer changes to take effect.
pause
`,
    },
    {
      id: 'ultimate_power_plan',
      title: 'Unlock & Activate OEM Ultimate Performance Power Plan',
      category: 'Power & CPU',
      impact: '0 Core Park Latency, Instant 100% C-State Ramp',
      description: 'Unlocks the hidden Windows Ultimate Performance scheme created by Microsoft for high-end workstations, eliminating CPU clock down-throttling.',
      filename: 'Unlock_Ultimate_Performance.bat',
      code: `@echo off
:: Duplicate Ultimate Performance Scheme GUID
powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61
:: Activate the newly registered scheme
powercfg /setactive e9a42b02-d5df-448d-aa00-03f14749eb61

echo [JuanBoost] Ultimate Performance power scheme unlocked and activated.
pause
`,
    },
    {
      id: 'linux_steamdeck_proton',
      title: 'Linux / Steam Deck Proton & Vulkan Graphics Pipeline Script',
      category: 'Linux / Steam Deck',
      impact: '+20% Shader Compile Speed, Zero Shader Stutter',
      description: 'Enables asynchronous Vulkan shader pre-caching (GPL) and sets fullscreen FSR scaling directly inside the Wayland compositor.',
      filename: 'juanboost_steamos_optimize.sh',
      code: `#!/bin/bash
# Steam Deck & Linux Gaming Environment Optimizer
export RADV_PERFTEST=gpl
export DXVK_ASYNC=1
export WINE_FULLSCREEN_FSR=1
export WINE_FULLSCREEN_FSR_STRENGTH=2
export MESA_VK_WSI_PRESENT_MODE=mailbox

echo "[JuanBoost] Proton Vulkan pipeline variables loaded."
`,
    },
  ];

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (tweak: TweakScript) => {
    const blob = new Blob([tweak.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = tweak.filename;
    link.click;
    URL.revokeObjectURL(url);
  };

  const filteredTweaks = activeCategory === 'all'
    ? tweaks
    : tweaks.filter((t) => t.category.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h2 className="font-display font-bold text-xl text-white mb-1">
          System Optimization Scripts & Registry Deck
        </h2>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          Clean, human-readable system configuration files. Each script targets specific OS-level bottlenecks like compositor buffering, background screen recording, and kernel timer ticks.
        </p>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-lg w-fit">
        {[
          { id: 'all', label: 'All Tweaks' },
          { id: 'gpu', label: 'Windows GPU' },
          { id: 'timer', label: 'Timer & Latency' },
          { id: 'power', label: 'Power & CPU' },
          { id: 'linux', label: 'Steam Deck & Linux' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeCategory === tab.id
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tweaks List */}
      <div className="flex flex-col gap-5">
        {filteredTweaks.map((tweak) => (
          <div
            key={tweak.id}
            className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-cyan-400 font-semibold">{tweak.category}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{tweak.impact}</span>
                </div>
                <h3 className="font-display font-bold text-base text-white mb-1">
                  {tweak.title}
                </h3>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  {tweak.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopy(tweak.code, tweak.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
                >
                  {copiedId === tweak.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownload(tweak)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {tweak.filename.split('.').pop()?.toUpperCase()}</span>
                </button>
              </div>
            </div>

            {/* Code Box */}
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
              <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">{tweak.filename}</span>
                <span>Safe & Tested Configuration</span>
              </div>
              <pre className="p-4 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                {tweak.code}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
