import React from 'react';
import { Zap, CheckCircle2, Smartphone, Download, Gauge, MousePointer, HardDrive, Battery, Gamepad2, FileCode } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOptimizing: boolean;
  onTriggerBoost: () => void;
  lastBoosted: boolean;
}

export const HeaderNav: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  isOptimizing,
  onTriggerBoost,
  lastBoosted,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Gauge },
    { id: 'android', label: 'Android Turbo', icon: Smartphone },
    { id: 'latency', label: 'Touch & Latency', icon: MousePointer },
    { id: 'memory', label: 'Memory Purge', icon: HardDrive },
    { id: 'battery', label: 'Battery Guard', icon: Battery },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'tweaks', label: 'OS Tweaks', icon: FileCode },
  ];

  const handleTabClick = (id: string) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // ignore
      }
    }
    onSelectTab(id);
  };

  const handleBoostClick = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 50, 30]);
      } catch {
        // ignore
      }
    }
    onTriggerBoost();
  };

  return (
    <>
      {/* Top Bar Contract header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Zone 1: Brand title, one line wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 font-display font-black text-base shadow-lg shadow-cyan-500/20">
            ⚡
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight text-white">
            Juan<span className="text-emerald-400">Boost</span>
          </span>
        </div>

        {/* Zone 2: Desktop 4-5 concise single-line nav links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === item.id
                  ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary action + Android Install trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {!isInstalled && isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-500/15 border border-emerald-500/50 text-emerald-300 rounded-lg hover:bg-emerald-500/25 transition-colors whitespace-nowrap"
              title="Install on Android Home Screen"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install Android App</span>
              <span className="sm:hidden">Install</span>
            </button>
          )}

          <button
            onClick={handleBoostClick}
            disabled={isOptimizing}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-md whitespace-nowrap shrink-0 ${
              lastBoosted
                ? 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-500'
                : 'bg-cyan-500 text-slate-950 shadow-cyan-500/25 hover:bg-cyan-400 font-bold'
            }`}
          >
            {isOptimizing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Optimizing...</span>
              </>
            ) : lastBoosted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Boosted</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>One-Click Boost</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Android Mobile Ergonomic Bottom Navigation Bar (Visible on mobile/tablet screens) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex items-center justify-around pb-safe">
        {[
          { id: 'overview', label: 'Dashboard', icon: Gauge },
          { id: 'android', label: 'Android', icon: Smartphone },
          { id: 'latency', label: 'Touch', icon: MousePointer },
          { id: 'memory', label: 'RAM', icon: HardDrive },
          { id: 'battery', label: 'Battery', icon: Battery },
          { id: 'tweaks', label: 'ADB', icon: FileCode },
        ].map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors min-w-[52px] min-h-[46px] ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <IconComponent className={`w-4 h-4 mb-0.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
