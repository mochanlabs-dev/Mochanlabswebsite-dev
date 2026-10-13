"use client";

import { useEffect, useRef } from "react";

/**
 * Single line of text scaled so it exactly spans its container's width,
 * re-fitted whenever the container resizes or fonts finish loading.
 */
export default function FitText({ children, className = "" }: { children: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = box.current!;
    const el = text.current!;
    const fit = () => {
      // Measure at a fixed reference size, then scale to the available width.
      el.style.fontSize = "100px";
      const ratio = container.clientWidth / el.scrollWidth;
      el.style.fontSize = `${100 * ratio}px`;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(container);
    document.fonts?.ready.then(fit);
    fit();
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className="w-full overflow-hidden">
      <span ref={text} className={`inline-block whitespace-nowrap ${className}`}>
        {children}
      </span>
    </div>
  );
}
