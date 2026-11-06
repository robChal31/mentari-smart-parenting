// Minimal renderer for the CMS body text (no raw markdown injection).
// Supports: ## headings, "1. " ordered lists, "- " unordered lists, **bold**.
import type { ReactNode } from "react";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-${index}`} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
    }
    return <span key={`${keyPrefix}-${index}`}>{part}</span>;
  });
}

export function renderContentBody(body: string): ReactNode[] {
  const blocks = body.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block, index) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

    if (lines.length === 1 && lines[0].startsWith("## ")) {
      return (
        <h2 key={index} className="mt-8 font-heading text-xl sm:text-2xl font-bold text-secondary">
          {lines[0].slice(3)}
        </h2>
      );
    }
    if (lines.every((l) => /^\d+\.\s/.test(l))) {
      return (
        <ol key={index} className="mt-4 list-decimal space-y-2 pl-6 marker:font-semibold marker:text-primary">
          {lines.map((line, i) => (
            <li key={i} className="pl-1">{renderInline(line.replace(/^\d+\.\s/, ""), `${index}-${i}`)}</li>
          ))}
        </ol>
      );
    }
    if (lines.every((l) => /^-\s/.test(l))) {
      return (
        <ul key={index} className="mt-4 list-disc space-y-2 pl-6 marker:text-accent">
          {lines.map((line, i) => (
            <li key={i} className="pl-1">{renderInline(line.replace(/^-\s/, ""), `${index}-${i}`)}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={index} className="mt-4 leading-7 text-[1.02rem] text-ink/90">
        {renderInline(block.replace(/\n/g, " "), `${index}`)}
      </p>
    );
  });
}
