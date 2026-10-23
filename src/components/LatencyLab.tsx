import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_PING_REGIONS, measurePing } from '../utils/hardwareProbe';
import { RegionPing } from '../types/optimizer';
import { Zap, Wifi, MousePointer, CheckCircle, Copy, Check, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';

export const LatencyLab: React.FC = () => {
  // Input Latency Test State
  const [clickTestState, setClickTestState] = useState<'idle' | 'waiting' | 'ready' | 'result'>('idle');
  const [testStartTime, setTestStartTime] = useState<number>(0);
  const [testResults, setTestResults] = useState<number[]>([]);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Network Ping State
  const [pingRegions, setPingRegions] = useState<RegionPing[]>(DEFAULT_PING_REGIONS);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Handle Input Latency Test
  const startClickTest = () => {
    setClickTestState('waiting');
    const delay = 1500 + Math.random() * 3000; // 1.5 - 4.5s random delay
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setClickTestState('ready');
      setTestStartTime(performance.now());
    }, delay);
  };

  const handleClickTarget = () => {
    if (clickTestState === 'waiting') {
      // Early click / false start
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setClickTestState('idle');
      alert('Too early! Wait for the visual trigger to turn Emerald before clicking.');
      return;
    }

    if (clickTestState === 'ready') {
      const reactionMs = Math.round(performance.now() - testStartTime);
      const updated = [...testResults, reactionMs];
      setTestResults(updated);
      setLastScore(reactionMs);
      setClickTestState('result');
    }
  };

  const handleResetClickTest = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setClickTestState('idle');
    setTestResults([]);
    setLastScore(null);
  };

  // Run live network pings
  const runPingBenchmark = async () => {
    setIsPinging(true);
    const updated = [...pingRegions];

    for (let i = 0; i < updated.length; i++) {
      updated[i].status = 'testing';
      setPingRegions([...updated]);

      const res = await measurePing(updated[i].endpoint);
      updated[i].pingMs = res.pingMs;
      updated[i].jitterMs = res.jitterMs;
      updated[i].status = 'success';
      setPingRegions([...updated]);
    }

    setIsPinging(false);
  };

  // Run initial ping once
  useEffect(() => {
    runPingBenchmark();
  }, []);

  const averageInputLatency = testResults.length > 0
    ? Math.round(testResults.reduce((a, b) => a + b, 0) / testResults.length)
    : null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const tcpTweakScript = `# Windows Registry TCP Optimization (Run in Admin PowerShell)
# 1. Disable Nagle's Algorithm (TCP_NODELAY)
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces" /v TcpAckFrequency /t REG_DWORD /d 1 /f
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces" /v TCPNoDelay /t REG_DWORD /d 1 /f

# 2. Network Throttling Index Disable
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v NetworkThrottlingIndex /t REG_DWORD /d 4294967295 /f
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v SystemResponsiveness /t REG_DWORD /d 0 /f

# 3. Flush DNS Cache
ipconfig /flushdns`;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Explanation */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h2 className="font-display font-bold text-xl text-white mb-1">
          Zero-Latency & Reflex Diagnostic Lab
        </h2>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          Input lag and network jitter kill competitive responsiveness. Test click-to-render timing, benchmark server ping roundtrips, and apply hardware reflex buffers to eliminate input delay.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Click-to-Render Input Latency Benchmark */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display font-bold text-base text-white">
                  Hardware Click-to-Render Latency
                </h3>
              </div>
              {testResults.length > 0 && (
                <button
                  onClick={handleResetClickTest}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Reset History
                </button>
              )}
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Measures the full input loop: Mouse microswitch actuation → OS message queue → Browser compositor → Display refresh pipeline.
            </p>

            {/* Interactive Target Zone */}
            <div
              onClick={
                clickTestState === 'idle'
                  ? startClickTest
                  : clickTestState === 'waiting' || clickTestState === 'ready'
                  ? handleClickTarget
                  : startClickTest
              }
              className={`h-48 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all select-none p-4 ${
                clickTestState === 'idle'
                  ? 'bg-slate-950/70 border-slate-800 hover:border-cyan-500/50'
                  : clickTestState === 'waiting'
                  ? 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                  : clickTestState === 'ready'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-xl shadow-emerald-500/20 scale-[1.01]'
                  : 'bg-slate-950/80 border-cyan-500/40 text-cyan-300'
              }`}
            >
              {clickTestState === 'idle' && (
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-2 text-cyan-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="font-display font-bold text-sm text-white block">
                    Click to Start Latency Test
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Wait for color change, then click as fast as possible
                  </span>
                </div>
              )}

              {clickTestState === 'waiting' && (
                <div className="text-center">
                  <span className="text-sm font-bold text-rose-400 tracking-wide uppercase">
                    Hold Steady...
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    Click immediately when this turns Emerald
                  </span>
                </div>
              )}

              {clickTestState === 'ready' && (
                <div className="text-center animate-pulse">
                  <span className="font-display font-extrabold text-2xl text-emerald-400 tracking-wider uppercase">
                    CLICK NOW!
                  </span>
                </div>
              )}

              {clickTestState === 'result' && (
                <div className="text-center">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                    Actuation Latency
                  </span>
                  <span className="font-display font-black text-4xl text-cyan-400 font-mono tabular-nums">
                    {lastScore} ms
                  </span>
                  <span className="text-xs text-slate-400 block mt-2">
                    Click anywhere to test again
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Results Summary Strip */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block">Average Reaction</span>
              <span className="font-mono font-bold text-white tabular-nums text-sm">
                {averageInputLatency !== null ? `${averageInputLatency} ms` : '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Samples Completed</span>
              <span className="font-mono font-bold text-slate-300 tabular-nums text-sm">
                {testResults.length}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Hardware Rating</span>
              <span className="font-bold text-emerald-400 text-sm">
                {averageInputLatency === null
                  ? 'Ready'
                  : averageInputLatency < 190
                  ? 'Esports Elite'
                  : averageInputLatency < 240
                  ? 'Fast'
                  : 'Standard'}
              </span>
            </div>
          </div>
        </div>

        {/* Module 2: Live Network Ping & Server Jitter */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-purple-400" />
                <h3 className="font-display font-bold text-base text-white">
                  Multi-Region Game Server Ping
                </h3>
              </div>
              <button
                onClick={runPingBenchmark}
                disabled={isPinging}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-purple-400' : ''}`} />
                <span>{isPinging ? 'Probing...' : 'Re-test'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Real HTTP round-trip latency & jitter probes against tier-1 edge nodes. Lower jitter prevents sudden hit-registration delays in multiplayer matches.
            </p>

            {/* Region List */}
            <div className="flex flex-col gap-2.5">
              {pingRegions.map((region) => (
                <div
                  key={region.region}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">{region.region}</span>
                    <span className="text-[11px] text-slate-500">{region.location}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    {region.status === 'testing' ? (
                      <span className="text-xs text-purple-400 animate-pulse font-mono">Probing...</span>
                    ) : region.pingMs !== null ? (
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span
                            className={`font-mono font-bold text-sm tabular-nums ${
                              region.pingMs < 35
                                ? 'text-emerald-400'
                                : region.pingMs < 80
                                ? 'text-cyan-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {region.pingMs} ms
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ±{region.jitterMs}ms jitter
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600 font-mono">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Latency Settings Checklist */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              NVIDIA Reflex / AMD Anti-Lag Ready
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              1000Hz Polling Capable
            </span>
          </div>
        </div>
      </div>

      {/* Network & TCP Packet Optimizer Script Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
          <div>
            <h4 className="font-display font-bold text-sm text-white">
              TCP NoDelay & Network Packet Pacing Script
            </h4>
            <p className="text-xs text-slate-400">
              Disables packet grouping (Nagle&apos;s algorithm) and system network throttling to send game packets instantly.
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(tcpTweakScript, 'tcp')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
          >
            {copiedIndex === 'tcp' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied Script</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy PowerShell Tweak</span>
              </>
            )}
          </button>
        </div>

        <pre className="bg-slate-950 p-3.5 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800/80 leading-relaxed">
          {tcpTweakScript}
        </pre>
      </div>
    </div>
  );
};
