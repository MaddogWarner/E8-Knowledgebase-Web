import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
  text: string;
}

export function CodeBlock({ text }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFailed(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setCopyFailed(true);
      window.setTimeout(() => setCopyFailed(false), 1800);
    }
  }

  return (
    <div className="code-block">
      <code>{text}</code>
      <button type="button" className="icon-button copy-button" onClick={copy} aria-label="Copy technical detail">
        {copied ? <Check size={16} /> : <Copy size={16} />}
        <span>{copied ? 'Copied' : copyFailed ? 'Failed' : 'Copy'}</span>
      </button>
    </div>
  );
}
