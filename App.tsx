
import React, { useState, useEffect } from 'react';
import { ProcessorType } from './types';
import { COMPARISON_SPECS, USE_CASES } from './constants';
import Visualizer from './components/Visualizer';
import AIAdvisor from './components/AIAdvisor';
import FineTuningLab from './components/FineTuningLab';
import { fetchRealWorldCases } from './services/geminiService';
import CaseStudyViewer from './components/CaseStudyViewer';


const App: React.FC = () => {
  const [selectedProcessor, setSelectedProcessor] = useState<ProcessorType>(ProcessorType.GPU);
  const [realCases, setRealCases] = useState<{text: string, grounding: any[]}>({text: '', grounding: []});
  const [isLoadingCases, setIsLoadingCases] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRealCases = async () => {
    setIsLoadingCases(true);
    setError(null);
    setRealCases({text: '', grounding: []});
    try {
      const data = await fetchRealWorldCases();
      setRealCases(data);
    } catch (e: any) {
      console.error(e);
      const errorMessage = e?.message || String(e);
      setError(`事例の取得に失敗しました: ${errorMessage}`);
    } finally {
      setIsLoadingCases(false);
    }
  };

  useEffect(() => {
    loadRealCases();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-800 pb-20 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* Header: Minimal & Clean */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <div className="text-lg font-bold tracking-tight text-slate-900">
            TPU vs GPU <span className="font-normal text-slate-500">Master</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-500">
            <a href="#lab" className="hover:text-slate-900 transition-colors">Simulation</a>
            <a href="#cases" className="hover:text-slate-900 transition-colors">Case Studies</a>
            <a href="#advisor" className="hover:text-slate-900 transition-colors">AI Advisor</a>
          </nav>
          <div className="flex bg-slate-50 p-1 rounded-full border border-slate-200">
             <button
              onClick={() => setSelectedProcessor(ProcessorType.GPU)}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-500 ${
                selectedProcessor === ProcessorType.GPU
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              GPU
            </button>
            <button
              onClick={() => setSelectedProcessor(ProcessorType.TPU)}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-500 ${
                selectedProcessor === ProcessorType.TPU
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              TPU
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-32 space-y-32">
        
        {/* Hero Section: Generous Whitespace, Elegant Typography */}
        <section className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold tracking-widest uppercase rounded-sm">
              Architecture Comparison
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
              {selectedProcessor === ProcessorType.GPU 
                ? "The Versatile Powerhouse." 
                : "The Matrix Specialist."}
            </h1>
            <p className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-lg font-light">
              {selectedProcessor === ProcessorType.GPU 
                ? "GPUは、AI学習からグラフィックスまで、あらゆる計算をこなす万能選手です。" 
                : "TPUは、Googleが開発したAI特化型プロセッサ。行列演算において圧倒的な効率を誇ります。"}
            </p>
            
            <div className="flex gap-12 pt-4 border-t border-slate-100">
                <div>
                   <div className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-semibold">Design</div>
                   <div className="font-medium text-slate-800">
                     {selectedProcessor === ProcessorType.GPU ? "Parallel Cores" : "Systolic Arrays"}
                   </div>
                </div>
                <div>
                   <div className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-semibold">Strength</div>
                   <div className="font-medium text-slate-800">
                     {selectedProcessor === ProcessorType.GPU ? "Versatility" : "Efficiency"}
                   </div>
                </div>
            </div>
          </div>
          <div className="relative">
            <div className={`absolute -inset-4 rounded-[3rem] opacity-20 blur-3xl transition-colors duration-1000 ${selectedProcessor === ProcessorType.GPU ? 'bg-indigo-200' : 'bg-purple-200'}`}></div>
            <div className="relative bg-white p-2 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
               <Visualizer type={selectedProcessor} />
            </div>
          </div>
        </section>

        {/* Use Cases: Grid Layout, Monosus Card Style (No Border, Clean) */}
        <section id="cases">
          <div className="mb-16 md:flex justify-between items-end border-b border-slate-100 pb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">Use Cases</h2>
            <p className="text-slate-500 mt-4 md:mt-0 max-w-md text-right text-sm">
                それぞれのアーキテクチャが輝く、10のシナリオ
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {USE_CASES.map((uc) => (
              <div key={uc.id} className="group cursor-pointer">
                <div className={`h-1 w-12 mb-6 transition-all duration-500 ${uc.recommendation === ProcessorType.GPU ? 'bg-indigo-500' : 'bg-purple-500'} group-hover:w-full`}></div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {uc.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4 min-h-[3em]">
                  {uc.description}
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 group-hover:text-slate-700 transition-colors">
                   <span>Recommended:</span>
                   <span className={`${uc.recommendation === ProcessorType.GPU ? 'text-indigo-600' : 'text-purple-600'}`}>{uc.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Simulation Lab: Cleaner Container */}
        <section id="lab" className="bg-slate-50 -mx-6 md:-mx-12 px-6 md:px-12 py-32">
          <div className="max-w-7xl mx-auto">
             <div className="text-center mb-20">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Simulation Lab</h2>
                <p className="text-slate-500">コストとパフォーマンスをリアルタイムに比較</p>
             </div>
             <FineTuningLab 
                selectedType={selectedProcessor} 
                onTypeChange={setSelectedProcessor} 
             />
          </div>
        </section>

        {/* Real World Cases: Magazine Style List */}
        <section className="max-w-5xl mx-auto">
          <div className="bg-slate-900 text-white rounded-[2rem] p-12 md:p-20 relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between gap-10 mb-16">
                   <div>
                      <div className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-4">Gemini Grounding</div>
                      <h2 className="text-4xl md:text-5xl font-bold">Latest Reality.</h2>
                   </div>
                   <button 
                      onClick={loadRealCases}
                      disabled={isLoadingCases}
                      className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-200 transition-colors disabled:opacity-50 text-sm"
                   >
                      {isLoadingCases ? 'Analyzing...' : 'Fetch Latest Cases'}
                   </button>
                </div>
                
                {isLoadingCases ? (
                  <div className="space-y-4 animate-pulse">
                     <div className="h-8 bg-white/10 w-1/3 rounded"></div>
                     <div className="h-4 bg-white/10 w-2/3 rounded"></div>
                     <div className="h-4 bg-white/10 w-1/2 rounded"></div>
                  </div>
                ) : error ? (
                   <div className="p-8 border border-red-500/30 bg-red-500/10 rounded-2xl text-center">
                      <p className="text-red-300 mb-4">{error}</p>
                      <button onClick={loadRealCases} className="text-sm font-bold underline">再試行</button>
                   </div>
                ) : realCases.text ? (
                   <CaseStudyViewer content={realCases.text} grounding={realCases.grounding} />
                ) : (
                   <div className="py-20 text-center border border-white/10 border-dashed rounded-xl">
                      <p className="text-slate-400">最新の導入事例データを取得します</p>
                   </div>
                )}
             </div>
          </div>
        </section>

        <section id="advisor" className="max-w-3xl mx-auto pb-20">
          <div className="text-center mb-10">
             <h3 className="text-2xl font-bold text-slate-800">AI Advisor</h3>
          </div>
          <AIAdvisor />
        </section>

      </main>

      {/* Footer: Simple Line */}
      <footer className="border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <p className="text-xs text-slate-400 tracking-widest uppercase">&copy; 2024 Chip Battle Master.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
