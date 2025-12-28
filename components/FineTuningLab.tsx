
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ProcessorType, HardwareProfile, ScenarioType, Scenario, ScenarioCategory } from '../types';
import { HARDWARE_PROFILES, SCENARIOS } from '../constants';

interface FineTuningLabProps {
  selectedType: ProcessorType;
  onTypeChange: (type: ProcessorType) => void;
}

const ChipMonitor: React.FC<{ 
  hw: HardwareProfile, 
  progress: number, 
  metrics: { throughput: number, cost: number, count: number },
  isRunning: boolean,
  color: 'indigo' | 'purple',
  label: string
}> = ({ hw, progress, metrics, isRunning, color, label }) => {
  const isDone = progress >= 100;
  const dotsCount = 48;
  
  return (
    <div className={`flex-1 p-8 space-y-6 transition-all duration-500 border-2 rounded-[2.5rem] ${
      isDone ? 'bg-emerald-50/30 border-emerald-100 shadow-lg shadow-emerald-50' : 
      isRunning ? (color === 'indigo' ? 'bg-indigo-50/30 border-indigo-100 shadow-xl shadow-indigo-50' : 'bg-purple-50/30 border-purple-100 shadow-xl shadow-purple-50') : 
      'bg-white border-slate-100'
    }`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
           <span className={`px-4 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-widest text-white shadow-lg ${
             isDone ? (color === 'indigo' ? 'bg-indigo-600' : 'bg-purple-600') : (color === 'indigo' ? 'bg-indigo-500' : 'bg-purple-500')
           }`}>
             {label}
           </span>
           {isDone && <span className={`font-black text-[10px] uppercase animate-bounce ${color === 'indigo' ? 'text-indigo-600' : 'text-purple-600'}`}>Completed!</span>}
        </div>
        <span className="text-xs font-black text-slate-400">{hw.name}</span>
      </div>

      <div className="bg-slate-950 rounded-3xl p-6 h-32 relative overflow-hidden border border-slate-800 shadow-inner group">
        <div className="grid grid-cols-12 gap-1.5 opacity-40">
           {Array.from({length: dotsCount}).map((_, i) => (
             <div 
               key={i} 
               className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                 isRunning && Math.random() > 0.7 
                  ? (color === 'indigo' ? 'bg-indigo-400 scale-150 shadow-[0_0_8px_rgba(129,140,248,0.8)]' : 'bg-purple-400 scale-150 shadow-[0_0_8px_rgba(192,132,252,0.8)]') 
                  : 'bg-slate-800'
               }`}
             ></div>
           ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
           <div className={`text-5xl font-black font-mono tracking-tighter transition-all ${isDone ? 'text-emerald-400' : 'text-slate-200'}`}>
              {Math.floor(progress)}<span className="text-xl">%</span>
           </div>
        </div>
        {isRunning && <div className={`absolute bottom-0 left-0 h-1 bg-${color}-500 w-full opacity-30 animate-pulse`}></div>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/50 border border-slate-100 p-4 rounded-2xl">
          <div className="text-[9px] font-black text-slate-400 uppercase mb-1">スループット</div>
          <div className={`text-xl font-black font-mono ${color === 'indigo' ? 'text-indigo-600' : 'text-purple-600'}`}>
            {isRunning || isDone ? metrics.throughput.toFixed(0) : '0'} <span className="text-[10px] font-sans text-slate-400">s/s</span>
          </div>
        </div>
        <div className="bg-white/50 border border-slate-100 p-4 rounded-2xl">
          <div className="text-[9px] font-black text-slate-400 uppercase mb-1">累計コスト</div>
          <div className="text-xl font-black font-mono text-emerald-600">
            <span className="text-xs">$</span>{metrics.cost.toFixed(4)}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
           <span>Progress</span>
           <span>{metrics.count.toLocaleString()} Items</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
           <div 
             className={`h-full rounded-full transition-all duration-100 relative ${
               isDone ? 'bg-emerald-500' : (color === 'indigo' ? 'bg-indigo-600' : 'bg-purple-600')
             }`}
             style={{ width: `${progress}%` }}
           >
             {isRunning && <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>}
           </div>
        </div>
      </div>
    </div>
  );
};

const FineTuningLab: React.FC<FineTuningLabProps> = () => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[1]); 
  const [hardwareA, setHardwareA] = useState<HardwareProfile>(HARDWARE_PROFILES[1]); 
  const [hardwareB, setHardwareB] = useState<HardwareProfile>(HARDWARE_PROFILES[4]); 
  
  const [workloadAmount, setWorkloadAmount] = useState(selectedScenario.workloadAmount);

  const [isRunning, setIsRunning] = useState(false);
  const [progressA, setProgressA] = useState(0);
  const [progressB, setProgressB] = useState(0);
  const [metricsA, setMetricsA] = useState({ throughput: 0, cost: 0, count: 0 });
  const [metricsB, setMetricsB] = useState({ throughput: 0, cost: 0, count: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWorkloadAmount(selectedScenario.workloadAmount);
    setProgressA(0);
    setProgressB(0);
    setMetricsA({ throughput: 0, cost: 0, count: 0 });
    setMetricsB({ throughput: 0, cost: 0, count: 0 });
  }, [selectedScenario]);

  const isTraining = selectedScenario.category === ScenarioCategory.TRAINING;
  const getThroughput = (hw: HardwareProfile) => isTraining ? hw.throughput : hw.inferenceThroughput;
  
  const projA = useMemo(() => {
    const tp = getThroughput(hardwareA);
    const timeSec = workloadAmount / tp;
    return { tp, timeMin: Math.ceil(timeSec / 60), cost: (hardwareA.costPerHour / 3600) * timeSec };
  }, [hardwareA, workloadAmount, isTraining]);

  const projB = useMemo(() => {
    const tp = getThroughput(hardwareB);
    const timeSec = workloadAmount / tp;
    return { tp, timeMin: Math.ceil(timeSec / 60), cost: (hardwareB.costPerHour / 3600) * timeSec };
  }, [hardwareB, workloadAmount, isTraining]);

  const rangeConfig = useMemo(() => {
    const base = selectedScenario.workloadAmount;
    return {
      min: Math.floor(base * 0.1),
      max: base * 100,
      step: Math.floor(base * 0.1)
    };
  }, [selectedScenario]);

  const summaryReport = useMemo(() => {
    const aFaster = projA.tp > projB.tp;
    const bFaster = projB.tp > projA.tp;
    const aCheaper = projA.cost < projB.cost;
    const bCheaper = projB.cost < projA.cost;

    let text = "";
    if (aFaster && aCheaper) {
      text = `${hardwareA.name}が、処理スピード・コスト効率の両面で${hardwareB.name}を圧倒。この規模の${selectedScenario.workloadUnit}処理にはChip Aが最適です。`;
    } else if (bFaster && bCheaper) {
      text = `${hardwareB.name}が、処理スピード・コスト効率の両面で${hardwareA.name}を圧倒。この規模の${selectedScenario.workloadUnit}処理にはChip Bが最適です。`;
    } else if (aFaster && bCheaper) {
      text = `${hardwareA.name}は処理スピードで勝りますが、${hardwareB.name}の方が安価です。時間に余裕があるならChip B、速度重視ならChip Aを選びましょう。`;
    } else if (bFaster && aCheaper) {
      text = `${hardwareB.name}は処理スピードで勝りますが、${hardwareA.name}の方が安価です。スループット重視ならChip B、予算重視ならChip Aが有利です。`;
    } else {
      text = "両者のパフォーマンスは非常に拮抗しています。コスト差も僅かであり、プラットフォームの好みや可用性で選んで問題ありません。";
    }

    return {
      text,
      speedWinner: aFaster ? hardwareA : hardwareB,
      costWinner: aCheaper ? hardwareA : hardwareB,
      speedDiff: (Math.max(projA.tp, projB.tp) / Math.min(projA.tp, projB.tp)).toFixed(1),
      costDiff: Math.abs(projA.cost - projB.cost).toFixed(4)
    };
  }, [projA, projB, hardwareA, hardwareB, selectedScenario]);

  // チップ名に応じたコードサンプルを返す
  const getCodeSample = (chipName: string): string => {
    if (chipName.includes('v5e')) {
      return `# JAX + TPU v5e での学習例
import jax
import jax.numpy as jnp
from jax.sharding import NamedSharding, Mesh, PartitionSpec as P

# TPU v5e デバイスの確認
devices = jax.devices('tpu')
print(f"TPU v5e pods: {len(devices)} chips")

# メッシュ定義（v5eの効率的なシャーディング）
mesh = Mesh(devices, axis_names=('data',))

# 自動シャーディングで分散
@jax.jit
def train_step(state, batch):
  def loss_fn(params):
    logits = state.apply_fn(params, batch['x'])
    return jnp.mean((logits - batch['y'])**2)
  
  grads = jax.grad(loss_fn)(state.params)
  # v5e: コスト効率重視の推論最適化
  return state.apply_gradients(grads=grads)

# v5e特徴: 低コスト・高効率な推論向け`;
    }
    
    if (chipName.includes('v4')) {
      return `# JAX + TPU v4 での学習例
import jax
import jax.numpy as jnp
from flax.training import train_state

# TPU v4 デバイスの確認
devices = jax.devices('tpu')
print(f"TPU v4 pods: {len(devices)} chips")

# pmap による従来の分散学習
@jax.pmap
def train_step(state, batch):
  def loss_fn(params):
    logits = state.apply_fn(params, batch['x'])
    return jnp.mean((logits - batch['y'])**2)
  
  grads = jax.grad(loss_fn)(state.params)
  return state.apply_gradients(grads=grads)

# v4特徴: 大規模学習に最適化されたHBM
# 光インターコネクトで高速なPod間通信`;
    }
    
    if (chipName.includes('H100')) {
      return `# PyTorch + NVIDIA H100 での学習例
import torch
import torch.nn as nn
from torch.distributed import init_process_group

# H100 デバイス確認
device = torch.device('cuda')
print(f"H100: {torch.cuda.get_device_name()}")
print(f"HBM3 Memory: {torch.cuda.mem_get_info()[1]/1e9:.0f}GB")

# Transformer Engine で FP8 学習
import transformer_engine.pytorch as te

class FP8Model(nn.Module):
  def __init__(self):
    super().__init__()
    # H100の FP8 Tensor Core を活用
    self.layer = te.Linear(1024, 1024)
  
  def forward(self, x):
    with te.fp8_autocast():
      return self.layer(x)

# H100特徴: FP8で2倍の学習スループット`;
    }
    
    if (chipName.includes('A100')) {
      return `# PyTorch + NVIDIA A100 での学習例
import torch
import torch.nn as nn
from torch.cuda.amp import autocast, GradScaler

# A100 デバイス確認
device = torch.device('cuda')
print(f"A100: {torch.cuda.get_device_name()}")
print(f"HBM2e Memory: {torch.cuda.mem_get_info()[1]/1e9:.0f}GB")

# Mixed Precision (AMP) で高速化
scaler = GradScaler()

class Model(nn.Module):
  def __init__(self):
    super().__init__()
    self.fc1 = nn.Linear(784, 2048)
    self.fc2 = nn.Linear(2048, 10)
  
  def forward(self, x):
    return self.fc2(torch.relu(self.fc1(x)))

model = Model().to(device)

# A100特徴: TF32でのTensor Core自動最適化
torch.backends.cuda.matmul.allow_tf32 = True`;
    }
    
    if (chipName.includes('L4')) {
      return `# PyTorch + NVIDIA L4 での推論例
import torch
import torch.nn as nn

# L4 デバイス確認
device = torch.device('cuda')
print(f"L4: {torch.cuda.get_device_name()}")

# INT8量子化で推論最適化
model = torch.quantization.quantize_dynamic(
  model, {nn.Linear}, dtype=torch.qint8
).to(device)

# TensorRT で推論高速化
import torch_tensorrt

trt_model = torch_tensorrt.compile(
  model,
  inputs=[torch_tensorrt.Input(shape=[1, 784])],
  enabled_precisions={torch.half}  # FP16推論
)

# L4特徴: 低消費電力・高効率な推論向け
# クラウドでのコスト効率が最高レベル`;
    }
    
    return `# サンプルコード
print("チップを選択してください")`;
  };

  const startComparison = () => {
    setIsRunning(true);
    setProgressA(0);
    setProgressB(0);
    setMetricsA({ throughput: 0, cost: 0, count: 0 });
    setMetricsB({ throughput: 0, cost: 0, count: 0 });
    setLogs([`[LAUNCH] ${selectedScenario.name} (${workloadAmount.toLocaleString()} ${selectedScenario.workloadUnit}) バトル開始`]);

    const maxThroughput = Math.max(...HARDWARE_PROFILES.map(h => isTraining ? h.throughput : h.inferenceThroughput));
    const simBaseSpeed = 0.5; 

    const interval = setInterval(() => {
      let isADone = false;
      let isBDone = false;

      setProgressA(prev => {
        if (prev >= 100) { isADone = true; return 100; }
        const step = (projA.tp / maxThroughput) * simBaseSpeed;
        const next = Math.min(100, prev + step);
        const realProgress = next / 100;
        setMetricsA({
          throughput: projA.tp + (Math.random() * 10 - 5),
          cost: projA.cost * realProgress,
          count: Math.floor(realProgress * workloadAmount)
        });
        if (next >= 100) {
          isADone = true;
          setLogs(l => [...l, `[DONE] ${hardwareA.name} が完了。`]);
        }
        return next;
      });

      setProgressB(prev => {
        if (prev >= 100) { isBDone = true; return 100; }
        const step = (projB.tp / maxThroughput) * simBaseSpeed;
        const next = Math.min(100, prev + step);
        const realProgress = next / 100;
        setMetricsB({
          throughput: projB.tp + (Math.random() * 10 - 5),
          cost: projB.cost * realProgress,
          count: Math.floor(realProgress * workloadAmount)
        });
        if (next >= 100) {
          isBDone = true;
          setLogs(l => [...l, `[DONE] ${hardwareB.name} が完了。`]);
        }
        return next;
      });

      if (isADone && isBDone) {
        clearInterval(interval);
        setIsRunning(false);
        setLogs(l => [...l, "[SUCCESS] 全ての計算が完了。分析レポートを生成しました。"]);
      }
    }, 50);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setProgressA(0);
    setProgressB(0);
    setMetricsA({ throughput: 0, cost: 0, count: 0 });
    setMetricsB({ throughput: 0, cost: 0, count: 0 });
    setLogs([]);
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-100 p-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="bg-slate-200/50 p-1.5 rounded-2xl flex shrink-0">
            {(['TRAINING', 'INFERENCE'] as ScenarioCategory[]).map(cat => (
              <button
                key={cat}
                disabled={isRunning}
                onClick={() => { setSelectedScenario(SCENARIOS.find(s => s.category === cat)!); }}
                className={`px-8 py-2 rounded-xl text-xs font-black uppercase transition-all ${selectedScenario.category === cat ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {cat === 'TRAINING' ? '学習' : '推論'}
              </button>
            ))}
          </div>
          <div className="flex-1 flex flex-wrap gap-2">
            {SCENARIOS.filter(s => s.category === selectedScenario.category).map(s => (
              <button
                key={s.id}
                disabled={isRunning}
                onClick={() => { setSelectedScenario(s); }}
                className={`px-4 py-2.5 rounded-xl text-[11px] font-bold border-2 transition-all ${selectedScenario.id === s.id ? 'border-indigo-500 bg-white text-indigo-600 shadow-sm' : 'border-slate-100 bg-white/40 text-slate-400'}`}
              >
                {s.name}
              </button>
            ))}
          </div>
          
          <div className="shrink-0 flex items-center gap-6 bg-white px-6 py-4 rounded-3xl border border-slate-200 shadow-sm min-w-[380px]">
            <div className="flex flex-col flex-1 gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">データ量 ({selectedScenario.workloadUnit})</span>
                <span className="text-[11px] font-black text-indigo-600">{workloadAmount.toLocaleString()}</span>
              </div>
              <input 
                type="range"
                min={rangeConfig.min}
                max={rangeConfig.max}
                step={rangeConfig.step}
                value={workloadAmount}
                onChange={(e) => {
                  setWorkloadAmount(Number(e.target.value));
                  setProgressA(0);
                  setProgressB(0);
                }}
                disabled={isRunning}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="flex flex-col gap-1 w-24">
               <span className="text-[8px] font-black text-slate-300 uppercase">直接入力</span>
               <input 
                 type="number"
                 value={workloadAmount}
                 onChange={(e) => {
                   const val = Number(e.target.value);
                   setWorkloadAmount(val);
                   setProgressA(0);
                   setProgressB(0);
                 }}
                 disabled={isRunning}
                 className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
               />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10">
           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Chip A 選択</label>
              <div className="grid grid-cols-3 gap-2">
                {HARDWARE_PROFILES.map(h => (
                  <button key={h.id} disabled={isRunning} onClick={() => { setHardwareA(h); resetSimulation(); }} className={`py-2 rounded-xl text-[10px] font-bold border-2 transition-all ${hardwareA.id === h.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300'}`}>{h.name}</button>
                ))}
              </div>
           </div>
           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Chip B 選択</label>
              <div className="grid grid-cols-3 gap-2">
                {HARDWARE_PROFILES.map(h => (
                  <button key={h.id} disabled={isRunning} onClick={() => { setHardwareB(h); resetSimulation(); }} className={`py-2 rounded-xl text-[10px] font-bold border-2 transition-all ${hardwareB.id === h.id ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300'}`}>{h.name}</button>
                ))}
              </div>
           </div>
        </div>

        {/* コードサンプル表示 */}
        <div className="grid grid-cols-2 gap-6 mt-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase rounded">Chip A</span>
              <span className="text-[10px] font-bold text-slate-500">{hardwareA.name} サンプルコード</span>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto max-h-[300px]">
              <pre className="text-[10px] text-slate-300 font-mono leading-relaxed">
{getCodeSample(hardwareA.name)}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-[9px] font-black uppercase rounded">Chip B</span>
              <span className="text-[10px] font-bold text-slate-500">{hardwareB.name} サンプルコード</span>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto max-h-[300px]">
              <pre className="text-[10px] text-slate-300 font-mono leading-relaxed">
{getCodeSample(hardwareB.name)}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="grid lg:grid-cols-2 gap-8 p-8 pb-12">
          <ChipMonitor 
            hw={hardwareA} 
            progress={progressA} 
            metrics={metricsA} 
            isRunning={isRunning && progressA < 100} 
            color="indigo" 
            label="Chip A" 
          />
          <ChipMonitor 
            hw={hardwareB} 
            progress={progressB} 
            metrics={metricsB} 
            isRunning={isRunning && progressB < 100} 
            color="purple" 
            label="Chip B" 
          />
        </div>

        <button
          onClick={startComparison}
          disabled={isRunning}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center transition-all transform active:scale-95 z-20 shadow-[0_0_50px_rgba(79,70,229,0.3)] ${
            isRunning ? 'bg-slate-800 scale-90' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-110 shadow-indigo-300'
          }`}
        >
          {isRunning ? (
            <svg className="animate-spin h-10 w-10 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <div className="flex flex-col items-center">
              <svg className="w-10 h-10 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              <span className="text-[8px] font-black text-indigo-200 tracking-tighter uppercase mt-1">Start Battle</span>
            </div>
          )}
        </button>

        {(progressA > 0 || progressB > 0) && !isRunning && (
          <button
            onClick={resetSimulation}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-slate-200 text-slate-600 rounded-full text-xs font-bold hover:bg-slate-300 transition-colors shadow-sm"
          >
            リセット
          </button>
        )}
      </div>

      <div className="p-10 bg-slate-950">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          <div className="flex-[4] bg-black/40 border border-slate-800 rounded-[2rem] p-6 h-[300px] overflow-y-auto font-mono text-[10px] custom-scrollbar shadow-inner">
            <div className="text-slate-600 uppercase tracking-widest font-black mb-4 border-b border-slate-900 pb-2 flex justify-between">
              <span>Simulation Log</span>
              <span className="animate-pulse text-indigo-500">Live</span>
            </div>
            {logs.map((log, i) => (
              <div key={i} className="flex gap-4 mb-1">
                <span className="text-slate-800 select-none">{i.toString().padStart(3, '0')}</span>
                <span className={log.includes('[SUCCESS]') ? 'text-green-400 font-bold' : log.includes('[DONE]') ? 'text-indigo-400 font-bold' : 'text-slate-500'}>{log}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>

          <div className="flex-[6] bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-[2rem] border border-white/5 relative overflow-hidden flex flex-col shadow-2xl min-h-[300px]">
            <h5 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
              結論と予測分析
            </h5>
            
            <div className="grid grid-cols-2 gap-8 relative z-10 mb-auto">
               <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">最速チップ</div>
                  <div className="space-y-1">
                    <div className="text-lg font-black text-white leading-tight truncate" title={summaryReport.speedWinner.name}>
                      {summaryReport.speedWinner.name} 
                    </div>
                    <div className="text-[10px] text-indigo-400 font-bold bg-indigo-500/20 inline-block px-2 py-0.5 rounded">
                      約 {summaryReport.speedDiff}倍 高速
                    </div>
                  </div>
               </div>

               <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">費用対効果</div>
                  <div className="space-y-1">
                    <div className="text-lg font-black text-white leading-tight truncate" title={summaryReport.costWinner.name}>
                      {summaryReport.costWinner.name} 
                    </div>
                    <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 inline-block px-2 py-0.5 rounded">
                      節約分: ${summaryReport.costDiff}
                    </div>
                  </div>
               </div>
            </div>

            <div className="mt-10 pt-6 border-t border-white/5 text-[11px] text-slate-300 leading-relaxed font-bold bg-white/5 p-5 rounded-2xl shadow-inner italic">
              {summaryReport.text}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FineTuningLab;
