
import { ProcessorType, ScenarioType, ScenarioCategory, Scenario, ComparisonData, UseCase, LabCode, HardwareProfile } from './types';

export const SCENARIOS: Scenario[] = [
  {
    id: ScenarioType.PRETRAINING,
    category: ScenarioCategory.TRAINING,
    name: 'LLM事前学習',
    description: '巨大なデータを使い、ゼロからモデルを構築。',
    workloadUnit: 'Tokens',
    workloadAmount: 1000000 
  },
  {
    id: ScenarioType.FINETUNING,
    category: ScenarioCategory.TRAINING,
    name: '微調整 (FT)',
    description: '特定のタスクに合わせてモデルを微調整。',
    workloadUnit: 'Steps',
    workloadAmount: 10000
  },
  {
    id: ScenarioType.REALTIME_INFERENCE,
    category: ScenarioCategory.INFERENCE,
    name: 'リアルタイム推論',
    description: 'チャットや翻訳など、即時性が求められる用途。',
    workloadUnit: 'Requests',
    workloadAmount: 1000
  },
  {
    id: ScenarioType.BATCH_INFERENCE,
    category: ScenarioCategory.INFERENCE,
    name: '一括処理',
    description: '数百万件のデータをまとめて分類・分析。',
    workloadUnit: 'Items',
    workloadAmount: 50000
  }
];

export const HARDWARE_PROFILES: HardwareProfile[] = [
  {
    id: 'gpu-l4',
    name: 'NVIDIA L4',
    type: ProcessorType.GPU,
    costPerHour: 0.70,
    setupDifficulty: 1,
    throughput: 150,
    inferenceThroughput: 300,
    latencyMs: 45,
    vram: '24GB',
    description: '省電力・低コスト。'
  },
  {
    id: 'gpu-a100',
    name: 'NVIDIA A100',
    type: ProcessorType.GPU,
    costPerHour: 3.67,
    setupDifficulty: 2,
    throughput: 600,
    inferenceThroughput: 1200,
    latencyMs: 25,
    vram: '80GB',
    description: '万能型AIチップ。'
  },
  {
    id: 'gpu-h100',
    name: 'NVIDIA H100',
    type: ProcessorType.GPU,
    costPerHour: 5.00,
    setupDifficulty: 2,
    throughput: 1500,
    inferenceThroughput: 3500,
    latencyMs: 12,
    vram: '80GB',
    description: '最強の汎用GPU。'
  },
  {
    id: 'tpu-v4-8',
    name: 'TPU v4-8',
    type: ProcessorType.TPU,
    costPerHour: 3.22,
    setupDifficulty: 4,
    throughput: 2000,
    inferenceThroughput: 5000,
    latencyMs: 30,
    vram: '256GB',
    description: 'Google Cloud専用。'
  },
  {
    id: 'tpu-v5e-8',
    name: 'TPU v5e-8',
    type: ProcessorType.TPU,
    costPerHour: 1.20,
    setupDifficulty: 5,
    throughput: 1800,
    inferenceThroughput: 4500,
    latencyMs: 18,
    vram: '128GB',
    description: 'コスパ最強のTPU。'
  }
];

export const COMPARISON_SPECS: ComparisonData[] = [
  {
    title: "設計思想",
    gpuValue: "汎用的な並列処理",
    tpuValue: "行列演算に特化した専用回路",
    description: "GPUはグラフィックスからAIまで、TPUはAI計算だけに特化しています。"
  },
  {
    title: "得意なデータ単位",
    gpuValue: "ベクトル (Vector) 処理",
    tpuValue: "行列 (Matrix) 処理",
    description: "GPUは1列のデータを、TPUは巨大な「表」を一気に処理します。"
  },
  {
    title: "電力効率",
    gpuValue: "中程度",
    tpuValue: "非常に高い",
    description: "AI学習効率に特化しているため、TPUの方がエコで高速な傾向があります。"
  }
];

export const USE_CASES: UseCase[] = [
  {
    id: '1',
    title: "大規模言語モデルのフル学習",
    description: "数千億パラメータを持つモデルをゼロから数ヶ月かけて構築。",
    recommendation: ProcessorType.TPU,
    reason: "数千枚のチップを効率よく繋ぐ「Pod」構成が必要なため、TPUが圧倒的に有利です。"
  },
  {
    id: '2',
    title: "映像制作・3Dゲーム開発",
    description: "最新の3Dグラフィックス描画やレイトレーシング。",
    recommendation: ProcessorType.GPU,
    reason: "グラフィックス処理はGPUの本来の領分であり、AI以外にも対応できる汎用性が必須です。"
  },
  {
    id: '3',
    title: "Stable DiffusionのLoRA学習",
    description: "特定のキャラクターや画風を少量の画像で覚えさせる。",
    recommendation: ProcessorType.GPU,
    reason: "中規模な学習では、PyTorchなど使い慣れたライブラリがそのまま動くGPUが手軽です。"
  },
  {
    id: '4',
    title: "自動運転の障害物検知",
    description: "車載カメラからリアルタイムに人間や標識を判別。",
    recommendation: ProcessorType.GPU,
    reason: "車載デバイス（NVIDIA Jetson等）との親和性が高く、環境の制約に対応しやすいです。"
  },
  {
    id: '5',
    title: "金融市場の高頻度取引分析",
    description: "数百万件の取引履歴から即座に不正や傾向を検知。",
    recommendation: ProcessorType.TPU,
    reason: "バッチ的な大規模行列演算が繰り返されるため、TPUの行列特化回路が真価を発揮します。"
  },
  {
    id: '6',
    title: "個人のPCでのAI実験",
    description: "ローカル環境でLLMを動かしたり簡単な学習を行う。",
    recommendation: ProcessorType.GPU,
    reason: "コンシューマー向け製品があり、誰でも安価に入手・実行できるのが最大のメリットです。"
  },
  {
    id: '7',
    title: "レコメンデーション・エンジン",
    description: "ECサイトの膨大なユーザーログからおすすめ商品を計算。",
    recommendation: ProcessorType.TPU,
    reason: "大規模な行列（ユーザー×商品）の掛け合わせが主となるため、TPUが極めて効率的です。"
  },
  {
    id: '8',
    title: "科学シミュレーション",
    description: "流体解析や気象シミュレーションなど高度な数値計算。",
    recommendation: ProcessorType.GPU,
    reason: "浮動小数点演算の精度を細かく制御する必要があり、汎用HPC向けのGPUが適しています。"
  },
  {
    id: '9',
    title: "モバイルアプリ向けAI推論",
    description: "スマホ上で動く翻訳や写真加工機能。",
    recommendation: ProcessorType.GPU,
    reason: "クラウドではなく「エッジ（末端）」で動かす必要があるため、小型GPUコアが使われます。"
  },
  {
    id: '10',
    title: "大規模タンパク質構造解析",
    description: "AlphaFoldのような創薬に向けた解析。",
    recommendation: ProcessorType.TPU,
    reason: "膨大なアテンション計算（行列演算）を並列で行う必要があり、TPUが得意とする領域です。"
  }
];

export const LAB_CODES: LabCode[] = [
  {
    title: "デバイスの指定",
    gpu: "# PyTorch\ndevice = 'cuda'\nmodel.to(device)",
    tpu: "# JAX / XLA\nimport jax\ndevice = jax.devices('tpu')[0]",
    explanation: "GPUは明示的なデータ転送が必要ですが、TPUはXLAコンパイラが自動で最適化します。"
  }
];
