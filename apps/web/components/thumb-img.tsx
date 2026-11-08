"use client";

import { useState } from "react";

/**
 * Lazy thumbnail <img> that removes itself on load error — the parent
 * container keeps its branded gradient underneath, so broken URLs
 * degrade gracefully to the gradient design.
 */
export function ThumbImg({ src, className = "" }: { src: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  // Content thumbnails are decorative; the title is adjacent in the card.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" aria-hidden onError={() => setFailed(true)} className={className} />;
}
