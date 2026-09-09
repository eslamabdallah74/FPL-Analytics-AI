import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Split lines while keeping structure
  const lines = content.split('\n');

  const renderFormattedInline = (text: string) => {
    // Process bold **text**, inline code `code`, and badges like (FDR: 2.8) or (£6.6M)
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\(.*?\))/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const inner = part.slice(2, -2);
        return (
          <strong key={index} className="font-extrabold text-emerald-300 bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-500/20">
            {inner}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        const inner = part.slice(1, -1);
        return (
          <code key={index} className="px-1.5 py-0.5 bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono text-xs rounded">
            {inner}
          </code>
        );
      }
      // Highlight FDR, xP, Price badges
      if (part.startsWith('(') && part.endsWith(')')) {
        const inner = part.slice(1, -1);
        if (inner.includes('FDR:') || inner.includes('xP') || inner.includes('£')) {
          return (
            <span key={index} className="inline-block mx-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-500/20 text-purple-200 border border-purple-500/30">
              {inner}
            </span>
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-gray-100 text-start">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // H1 or H2
        if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
          const headerText = trimmed.replace(/^#+\s*/, '');
          return (
            <h2 key={idx} className="text-base sm:text-lg font-black text-white pt-2 pb-1 border-b border-purple-500/30 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              {renderFormattedInline(headerText)}
            </h2>
          );
        }

        // H3 or H4
        if (trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
          const headerText = trimmed.replace(/^#+\s*/, '');
          return (
            <h3 key={idx} className="text-sm sm:text-base font-extrabold text-purple-200 pt-2 pb-0.5 flex items-center gap-2">
              {renderFormattedInline(headerText)}
            </h3>
          );
        }

        // Bullet list item
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const listText = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2.5 rtl:space-x-reverse py-0.5 ps-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0 shadow-sm shadow-emerald-400"></span>
              <div className="flex-1">{renderFormattedInline(listText)}</div>
            </div>
          );
        }

        // Numbered list item (e.g., "1. ")
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          const [, num, listText] = numMatch;
          return (
            <div key={idx} className="flex items-start gap-2.5 py-1 ps-1 bg-white/5 rounded-xl px-3 border border-white/5 my-1">
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs shrink-0 mt-0.5 border border-emerald-500/30">
                {num}
              </span>
              <div className="flex-1 text-gray-200">{renderFormattedInline(listText)}</div>
            </div>
          );
        }

        // Horizontal rule
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={idx} className="my-3 border-white/10" />;
        }

        // Normal paragraph
        return (
          <p key={idx} className="leading-relaxed">
            {renderFormattedInline(line)}
          </p>
        );
      })}
    </div>
  );
};
