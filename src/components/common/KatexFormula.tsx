import React from 'react';
import katex from 'katex';

interface KatexFormulaProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const KatexFormula: React.FC<KatexFormulaProps> = ({ math, block = false, className = '' }) => {
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      });
    } catch {
      return math;
    }
  }, [math, block]);

  return (
    <span
      className={`inline-katex ${block ? 'block my-1.5 text-center overflow-x-auto py-1' : 'inline-block mx-0.5 align-middle'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface KatexTextProps {
  text: string;
  className?: string;
}

export const KatexText: React.FC<KatexTextProps> = ({ text, className = '' }) => {
  const parts = React.useMemo(() => {
    if (!text || !text.includes('$')) {
      return [{ type: 'text', content: text }];
    }
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
    const tokens: Array<{ type: 'text' | 'inline' | 'block'; content: string }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      const raw = match[0];
      if (raw.startsWith('$$') && raw.endsWith('$$')) {
        tokens.push({ type: 'block', content: raw.slice(2, -2) });
      } else if (raw.startsWith('$') && raw.endsWith('$')) {
        tokens.push({ type: 'inline', content: raw.slice(1, -1) });
      }
      lastIndex = match.index + raw.length;
    }
    if (lastIndex < text.length) {
      tokens.push({ type: 'text', content: text.substring(lastIndex) });
    }
    return tokens;
  }, [text]);

  return (
    <span className={className}>
      {parts.map((p, idx) => {
        if (p.type === 'text') {
          return <React.Fragment key={idx}>{p.content}</React.Fragment>;
        }
        return <KatexFormula key={idx} math={p.content} block={p.type === 'block'} />;
      })}
    </span>
  );
};
