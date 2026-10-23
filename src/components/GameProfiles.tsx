import React, { useState } from 'react';
import { GameProfile } from '../types/optimizer';
import { Gamepad2, Play, Download, Copy, Check, Plus, Settings2, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export const GameProfiles: React.FC = () => {
  const [games, setGames] = useState<GameProfile[]>([
    {
      id: 'cyber_assault',
      title: 'Strike Force: Neon Void',
      genre: 'Competitive Tactical Shooter',
      coverImage: '/src/assets/images/game_cover_cyber_assault_1792773938415.jpg',
      targetFps: 165,
      resolution: '1920×1080 (100% Native)',
      apiMode: 'DirectX 12',
      upscaler: 'Native',
      latencyMode: 'NVIDIA Reflex ON+Boost',
      launchParameters: '-high -threads 8 -novid -fullscreen +fps_max 165 -tickrate 128 -nojoy',
      estimatedBatteryHours: 2.1,
      recommendedProfile: 'ultra',
    },
    {
      id: 'speed_horizon',
      title: 'Speed Horizon: Neon Drift',
      genre: 'Open-World High Speed Racing',
      coverImage: '/src/assets/images/game_cover_speed_horizon_1792773939077.jpg',
      targetFps: 120,
      resolution: '2560×1440 (Dynamic 85%)',
      apiMode: 'DirectX 12',
      upscaler: 'DLSS 3',
      latencyMode: 'NVIDIA Reflex ON+Boost',
      launchParameters: '-d3d12 -high -USEALLAVAILABLECORES -sm5 +fps_max 120',
      estimatedBatteryHours: 2.6,
      recommendedProfile: 'balanced',
    },
    {
      id: 'orbital_strike',
      title: 'Orbital Strike: Mech Wars',
      genre: 'Tactical Sci-Fi Mech Combat',
      coverImage: '/src/assets/images/game_cover_orbital_strike_1792773938959.jpg',
      targetFps: 90,
      resolution: '1920×1080 (75% FSR Quality)',
      apiMode: 'Vulkan',
      upscaler: 'FSR 3',
      latencyMode: 'AMD Anti-Lag 2',
      launchParameters: '-vulkan -force-d3d11-no-singlethreaded -high -novsync',
      estimatedBatteryHours: 3.2,
      recommendedProfile: 'battery',
    },
  ]);

  const [selectedGameId, setSelectedGameId] = useState<string>('cyber_assault');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newGenre, setNewGenre] = useState<string>('Action RPG');

  const selectedGame = games.find((g) => g.id === selectedGameId) || games[0];

  const handleCopyParameters = (params: string) => {
    navigator.clipboard.writeText(params);
    setCopiedId('params');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadBatchScript = (game: GameProfile) => {
    const script = `@echo off
:: JuanBoost Optimizer Launcher for ${game.title}
echo [JuanBoost] Optimizing system resources for ${game.title}...
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
wmic process where name="explorer.exe" CALL setpriority 64
echo [JuanBoost] Launching game executable with optimized flags...
start "" /high "${game.title}.exe" ${game.launchParameters}
echo [JuanBoost] High priority thread active. Enjoy smooth gaming!
`;
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Launch_${game.id}_Optimized.bat`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAddGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newGame: GameProfile = {
      id: `game_${Date.now()}`,
      title: newTitle.trim(),
      genre: newGenre,
      coverImage: '/src/assets/images/hero_gaming_hardware_1792773936924.jpg',
      targetFps: 144,
      resolution: '1920×1080 Native',
      apiMode: 'DirectX 12',
      upscaler: 'DLSS 3',
      latencyMode: 'NVIDIA Reflex ON+Boost',
      launchParameters: '-high -threads 8 -fullscreen +fps_max 144',
      estimatedBatteryHours: 2.5,
      recommendedProfile: 'balanced',
    };

    setGames([...games, newGame]);
    setSelectedGameId(newGame.id);
    setNewTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-white mb-1">
            Per-Game Custom Profiles & Launch Tuner
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Every game engine responds differently to thread scheduling, DirectX 12 vs Vulkan pipelines, and memory pre-allocation. Launch games with tailor-made priority flags and graphics settings.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>Add Custom Game</span>
        </button>
      </div>

      {/* Main Split Layout: Game Selector List on Left, Active Game Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Game List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider px-1">
            Installed Game Library
          </span>

          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGameId(game.id)}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3.5 ${
                selectedGame.id === game.id
                  ? 'bg-slate-900 border-cyan-500/70 shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-700/80">
                <img
                  src={game.coverImage}
                  alt={game.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{game.title}</h4>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{game.genre}</div>
                <div className="text-[10px] text-cyan-400 font-mono mt-1 flex items-center gap-1.5">
                  <span>{game.targetFps} FPS Target</span>
                  <span className="text-slate-600">·</span>
                  <span>{game.apiMode}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Active Game Inspector & Launcher (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            {/* Game Cover Hero Banner */}
            <div className="relative h-52 sm:h-64 w-full overflow-hidden bg-slate-950">
              <img
                src={selectedGame.coverImage}
                alt={selectedGame.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

              <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-mono text-cyan-400 block mb-1">
                    {selectedGame.genre}
                  </span>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                    {selectedGame.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleDownloadBatchScript(selectedGame)}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-lg shadow-cyan-500/25 whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Optimized Launcher (.bat)</span>
                </button>
              </div>
            </div>

            {/* Profile Specifics Grid */}
            <div className="p-6 flex flex-col gap-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Graphics API</span>
                  <span className="font-mono font-bold text-white text-sm">{selectedGame.apiMode}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Target Frame Rate</span>
                  <span className="font-mono font-bold text-cyan-400 text-sm">{selectedGame.targetFps} FPS</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Upscaling Engine</span>
                  <span className="font-mono font-bold text-white text-sm">{selectedGame.upscaler}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Latency Pacing</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{selectedGame.latencyMode}</span>
                </div>
              </div>

              {/* Command Line Launch Arguments */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Engine Command-Line Parameters (Steam / Epic / Standalone)
                  </span>
                  <button
                    onClick={() => handleCopyParameters(selectedGame.launchParameters)}
                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {copiedId === 'params' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied to Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Parameters</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-200 overflow-x-auto whitespace-nowrap">
                  {selectedGame.launchParameters}
                </div>
                <span className="text-[11px] text-slate-500">
                  Paste these into Steam Game Properties &gt; Launch Options to apply high thread priority and disable unneeded background joystick polling.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Game Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-display font-bold text-lg text-white mb-2">
              Add Game to Optimizer Library
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter title and select profile defaults to generate custom launcher configurations.
            </p>

            <form onSubmit={handleAddGame} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Game Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Legends, Valorant, Elden Ring"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Genre</label>
                <select
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Tactical FPS">Tactical FPS</option>
                  <option value="Battle Royale">Battle Royale</option>
                  <option value="Action RPG">Action RPG</option>
                  <option value="Racing Simulator">Racing Simulator</option>
                  <option value="Indie / Fast Paced">Indie / Fast Paced</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors"
                >
                  Add Game Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
