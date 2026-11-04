"use client";

import { useRef, useState } from "react";

// A demo film that stays a poster until it is played. It loads nothing until
// then (preload="none"), shows the browser's own controls once it is running,
// and goes back to the poster when it ends.
export default function ProductVideo({ src, poster, title, length }: { src: string; poster: string; title: string; length: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const play = () => {
    setStarted(true);
    ref.current?.play().catch(() => {});
  };

  return (
    <div className="group relative aspect-video overflow-hidden rounded-lg border border-ink/10 bg-ink shadow-[0_40px_90px_-50px_rgb(0_0_0/0.45)]">
      <video
        ref={ref}
        src={src}
        poster={poster}
        preload="none"
        playsInline
        controls={started}
        aria-label={`${title} demo`}
        onEnded={() => {
          setStarted(false);
          if (ref.current) ref.current.currentTime = 0;
        }}
        className="size-full object-cover"
      />
      {!started && (
        <button
          type="button"
          onClick={play}
          aria-label={`Play the ${title} demo`}
          className="absolute inset-0 grid place-items-center bg-ink/0 transition-colors duration-300 hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-accent"
        >
          <span className="grid size-[4.5rem] place-items-center rounded-full bg-card text-accent shadow-[0_12px_40px_-10px_rgb(0_0_0/0.5)] transition-transform duration-300 group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="ml-0.5 size-7" fill="currentColor" aria-hidden>
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
            </svg>
          </span>
          <span className="absolute bottom-4 left-4 rounded-full bg-card/95 px-3 py-1.5 text-xs font-medium">Watch the demo · {length}</span>
        </button>
      )}
    </div>
  );
}
