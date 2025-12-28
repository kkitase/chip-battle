import React from "react";

interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

interface CaseStudyViewerProps {
  content: string;
  grounding?: GroundingChunk[];
}

export const CaseStudyViewer: React.FC<CaseStudyViewerProps> = ({ content, grounding = [] }) => {
  if (!content) return null;

  const processMarkdown = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-indigo-400 font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const renderLine = (line: string): React.ReactNode | null => {
    if (line.match(/^-{3,}$/)) return null;
    if ((line.toLowerCase().includes("ソース") || line.toLowerCase().includes("出典")) && line.includes("http")) {
      return null;
    }
    if (line.match(/^https?:\/\/[^\s]+$/)) return null;
    const cleanedText = line.replace(/https?:\/\/[^\s]+/g, '').trim();
    if (!cleanedText) return null;
    return processMarkdown(cleanedText);
  };

  const renderTableCell = (text: string): React.ReactNode => {
    const cleanedText = text.replace(/https?:\/\/[^\s]+/g, '').trim();
    if (!cleanedText) return '';
    return processMarkdown(cleanedText);
  };

  const renderTable = (lines: string[]) => {
    const parseRow = (row: string) => {
      const cells = row.split("|");
      const filtered = cells.filter((cell, idx) => {
        const trimmed = cell.trim();
        if (idx === 0 && trimmed === '') return false;
        if (idx === cells.length - 1 && trimmed === '') return false;
        return true;
      });
      return filtered.map((cell) => cell.trim());
    };
    
    const validRows = lines.filter((line) => line.includes("|") && !line.match(/^[|:\s-]+$/));
    if (validRows.length < 2) return null;

    const header = parseRow(validRows[0]);
    const body = validRows.slice(1).map(parseRow);

    return (
      <div className="my-10 overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl">
        <div className="bg-slate-800/50 px-6 py-4 border-b border-white/10">
          <h4 className="text-sm font-black text-indigo-300 uppercase tracking-widest">
            比較まとめ表
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-400">
                {header.map((cell, i) => (
                  <th key={i} className="px-6 py-4 font-black uppercase border-b border-white/10">
                    {renderTableCell(cell) || cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {body.map((row, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  {row.map((cell, j) => (
                    <td key={j} className="px-6 py-4 leading-relaxed">
                      {renderTableCell(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSectionHeader = (title: string, type: 'tpu' | 'gpu') => {
    const bgColor = type === 'tpu' ? 'bg-purple-500' : 'bg-indigo-500';
    
    return (
      <div className="flex items-center gap-4 mb-8">
        <div className={`${bgColor} px-4 py-2 rounded-xl`}>
          <span className="text-white font-black text-sm uppercase tracking-widest">
            {type.toUpperCase()}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          {title}
        </h2>
      </div>
    );
  };

  // 企業名に関連するソースを取得（最大3件）
  const getRelevantSources = (companyName: string): GroundingChunk[] => {
    if (!grounding || grounding.length === 0) return [];
    
    const keywords = companyName
      .replace(/[（()）]/g, ' ')
      .split(/\s+/)
      .filter(k => k.length > 1)
      .map(k => k.toLowerCase());
    
    const sources = grounding.filter(chunk => {
      if (!chunk.web?.uri) return false;
      const title = (chunk.web?.title || '').toLowerCase();
      const uri = chunk.web.uri.toLowerCase();
      return keywords.some(keyword => 
        title.includes(keyword) || uri.includes(keyword)
      );
    });

    // 最大3件に制限
    return sources.slice(0, 3);
  };

  const renderCaseSources = (companyName: string) => {
    const sources = getRelevantSources(companyName);
    if (sources.length === 0) return null;

    return (
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          参考ソース
        </div>
        <div className="space-y-2">
          {sources.map((chunk, idx) => (
            <a
              key={idx}
              href={chunk.web!.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors group"
            >
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="truncate group-hover:underline">
                {chunk.web?.title || chunk.web!.uri}
              </span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const lines = content.split('\n').map(l => l.trim());
  const elements: React.ReactNode[] = [];
  let currentCase: { title: string; lines: string[] } | null = null;
  let tableLines: string[] = [];
  let inTable = false;

  const flushCase = () => {
    if (currentCase && currentCase.lines.length > 0) {
      const caseTitle = currentCase.title;
      
      // 参考ソースがない事例はスキップ
      const sources = getRelevantSources(caseTitle);
      if (sources.length === 0) {
        currentCase = null;
        return;
      }

      const caseContent = currentCase.lines
        .filter(l => !l.match(/^-{3,}$/))
        .map((line, idx) => {
          const rendered = renderLine(line);
          if (!rendered) return null;
          return <p key={idx}>{rendered}</p>;
        })
        .filter(Boolean);

      if (caseContent.length > 0 || caseTitle) {
        elements.push(
          <div
            key={`case-${elements.length}`}
            className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-xl hover:border-indigo-500/30 transition-all group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-1.5 h-8 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
              <h3 className="text-2xl md:text-3xl font-black text-white group-hover:text-indigo-400 transition-colors">
                {caseTitle}
              </h3>
            </div>
            <div className="space-y-4 text-slate-300 text-base md:text-lg leading-relaxed font-medium">
              {caseContent}
            </div>
            {renderCaseSources(caseTitle)}
          </div>
        );
      }
    }
    currentCase = null;
  };

  const flushTable = () => {
    if (tableLines.length > 0) {
      const table = renderTable(tableLines);
      if (table) {
        elements.push(<div key={`table-${elements.length}`}>{table}</div>);
      }
      tableLines = [];
    }
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^-{3,}$/)) continue;

    if (line.startsWith('## ')) {
      flushCase();
      flushTable();
      
      const title = line.replace(/^##\s*/, '');
      const lowerTitle = title.toLowerCase();
      
      if (lowerTitle.includes('tpu')) {
        elements.push(
          <div key={`section-${elements.length}`}>
            {renderSectionHeader(title, 'tpu')}
          </div>
        );
      } else if (lowerTitle.includes('gpu')) {
        elements.push(
          <div key={`section-${elements.length}`}>
            {renderSectionHeader(title, 'gpu')}
          </div>
        );
      }
      continue;
    }

    if (line.startsWith('### ')) {
      flushCase();
      flushTable();
      
      const title = line.replace(/^###\s*/, '');
      currentCase = { title, lines: [] };
      continue;
    }

    if (line.includes('|') && !line.match(/^[|:\s-]+$/)) {
      flushCase();
      inTable = true;
      tableLines.push(line);
      continue;
    }

    if (line.match(/^[|:\s-]+$/)) {
      tableLines.push(line);
      continue;
    }

    if (inTable && !line.includes('|')) {
      flushTable();
    }

    if (currentCase) {
      currentCase.lines.push(line);
    } else if (line && !line.startsWith('#')) {
      const rendered = renderLine(line);
      if (rendered) {
        elements.push(
          <p key={`intro-${elements.length}`} className="text-slate-300 text-lg leading-relaxed mb-6">
            {rendered}
          </p>
        );
      }
    }
  }

  flushCase();
  flushTable();

  return (
    <div className="space-y-8">
      {elements}
    </div>
  );
};

export default CaseStudyViewer;


