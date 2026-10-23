import React from 'react';
import { Zap, CheckCircle2 } from 'lucide-react';

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
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'latency', label: 'Latency Lab' },
    { id: 'memory', label: 'Memory Purge' },
    { id: 'battery', label: 'Battery Guard' },
    { id: 'games', label: 'Game Library' },
    { id: 'tweaks', label: 'OS Tweaks' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between gap-8">
      {/* Zone 1: Brand title, one line wordmark */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-black font-display font-black text-base shadow-lg shadow-cyan-500/20">
          ⚡
        </div>
        <span className="font-display font-extrabold text-xl tracking-tight text-white">
          Juan<span className="text-cyan-400">Boost</span>
        </span>
      </div>

      {/* Zone 2: 4-5 concise single-line nav links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === item.id
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onTriggerBoost}
          disabled={isOptimizing}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-md whitespace-nowrap shrink-0 ${
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
              <span>Optimized (Boosted)</span>
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
  );
};
