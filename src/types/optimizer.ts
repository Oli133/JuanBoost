export type OptimizationMode = 'ultra' | 'balanced' | 'battery' | 'custom';

export interface HardwareSpecs {
  gpuRenderer: string;
  gpuVendor: string;
  cpuCores: number;
  deviceMemoryGB: number;
  displayRefreshHz: number;
  batterySupported: boolean;
  batteryLevel: number; // 0 - 100
  batteryCharging: boolean;
  batteryDischargeTime: number | null; // seconds
  networkEffectiveType: string;
  networkDownlinkMbps: number;
  networkRttMs: number;
}

export interface OptimizerSettings {
  mode: OptimizationMode;
  targetFps: number; // e.g. 60, 120, 144, 240, 0 (unlimited)
  resolutionScale: number; // 50 to 120 (%)
  lowLatencyMode: boolean; // Ultra low latency reflex buffer
  antiAliasing: boolean;
  particleDensity: number; // 100 to 5000
  dynamicResolution: boolean;
  ramOptimization: boolean;
  backgroundThrottle: boolean;
  batterySaverActive: boolean;
  tdpWattLimit: number; // 10 to 65W
  fanCurveProfile: 'silent' | 'balanced' | 'turbo';
  audioLatencyFix: boolean;
}

export interface BenchmarkMetrics {
  currentFps: number;
  averageFps: number;
  percentile1Low: number;
  frameTimeMs: number;
  inputLatencyMs: number;
  gpuUtilization: number; // 0 - 100%
  ramUsageMB: number;
  batteryDrainWatts: number;
  frameHistory: number[]; // last 60 frame times (ms)
}

export interface GameProfile {
  id: string;
  title: string;
  genre: string;
  coverImage: string;
  targetFps: number;
  resolution: string;
  apiMode: 'DirectX 12' | 'Vulkan' | 'DirectX 11';
  upscaler: 'DLSS 3' | 'FSR 3' | 'Native' | 'XeSS';
  latencyMode: 'NVIDIA Reflex ON+Boost' | 'AMD Anti-Lag 2' | 'Standard';
  launchParameters: string;
  estimatedBatteryHours: number;
  recommendedProfile: OptimizationMode;
}

export interface RegionPing {
  region: string;
  location: string;
  endpoint: string;
  pingMs: number | null;
  jitterMs: number | null;
  status: 'idle' | 'testing' | 'success' | 'failed';
}
