
export enum ProcessorType {
  GPU = 'GPU',
  TPU = 'TPU'
}

export enum ScenarioCategory {
  TRAINING = 'TRAINING',
  INFERENCE = 'INFERENCE'
}

export enum ScenarioType {
  PRETRAINING = 'PRETRAINING',
  FINETUNING = 'FINETUNING',
  REALTIME_INFERENCE = 'REALTIME_INFERENCE',
  BATCH_INFERENCE = 'BATCH_INFERENCE'
}

export interface Scenario {
  id: ScenarioType;
  category: ScenarioCategory;
  name: string;
  description: string;
  workloadUnit: string;
  workloadAmount: number;
}

export interface HardwareProfile {
  id: string;
  name: string;
  type: ProcessorType;
  costPerHour: number;
  setupDifficulty: number; // 1-5
  throughput: number; // base samples/sec (for training)
  inferenceThroughput: number; // base requests/sec (for inference)
  latencyMs: number; // Typical latency for single request
  vram: string;
  description: string;
}

export interface ComparisonData {
  title: string;
  gpuValue: string;
  tpuValue: string;
  description: string;
}

export interface UseCase {
  id: string;
  title: string;
  description: string;
  recommendation: ProcessorType;
  reason: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface LabCode {
  title: string;
  gpu: string;
  tpu: string;
  explanation: string;
}
