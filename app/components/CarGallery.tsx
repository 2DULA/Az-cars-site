"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function CarGallery({
  title,
  mainPhoto,
  thumbs,
}: {
  title: string;
  badge?: string;
  subtitle?: string;
  mainPhoto: string | null;
  thumbs: string[];
}) {
  // Build the full image list once: mainPhoto first (if not already in thumbs), then thumbs.
  const images = useRef<string[]>(
    mainPhoto && !thumbs.includes(mainPhoto) ? [mainPhoto, ...thumbs] : thumbs.length ? thumbs : mainPhoto ? [mainPhoto] : []
  ).current;

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const hasImages = images.length > 0;
  const active = hasImages ? images[activeIndex] : null;

  const goTo = useCallback(
    (idx: number) => {
      if (!hasImages) return;
      const next = (idx + images.length) % images.length;
      setActiveIndex(next);
    },
    [hasImages, images.length]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Keep the active thumbnail scrolled into view.
  useEffect(() => {
    const strip = thumbStripRef.current;
    if (!strip) return;
    const btn = strip.children[activeIndex] as HTMLElement | undefined;
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeIndex]);

  // Keyboard navigation for the lightbox.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowRight") goPrev(); // RTL: right = previous
      else if (e.key === "ArrowLeft") goNext(); // RTL: left = next
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, goNext, goPrev]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 40;
    if (delta > threshold) goPrev(); // swipe right -> previous (RTL)
    else if (delta < -threshold) goNext(); // swipe left -> next (RTL)
    touchStartX.current = null;
  }

  return (
    <>
      <div
        className="relative w-full aspect-[21/9] bg-ink overflow-hidden group"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {active ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="block w-full h-full cursor-zoom-in"
            aria-label="عرض الصورة بالحجم الكامل"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active}
              alt={title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </button>
        ) : (
          <div className="flex h-full items-center justify-center text-paper/40 font-mono">
            لا توجد صور متوفرة
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="الصورة السابقة"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 text-white w-10 h-10 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronIcon direction="right" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="الصورة التالية"
              className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 text-white w-10 h-10 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronIcon direction="left" />
            </button>

            <div className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1 text-white text-xs font-mono">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 lg:px-8 -mt-8 relative z-10">
          <div className="relative">
            <div
              ref={thumbStripRef}
              className="flex gap-2 overflow-x-auto bg-paper border border-line rounded-xl p-3 shadow-sm scroll-smooth"
            >
              {images.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    activeIndex === idx
                      ? "border-steel opacity-100"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    className="w-full h-full object-cover"
                    alt={`Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
            {/* Edge fade hints that the strip scrolls */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-paper to-transparent rounded-r-xl" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-paper to-transparent rounded-l-xl" />
          </div>
        </div>
      )}

      {lightboxOpen && active && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="إغلاق"
            className="absolute top-4 left-4 text-white/80 hover:text-white w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <CloseIcon />
          </button>

          <div className="absolute top-4 right-4 rounded-full bg-white/10 px-3 py-1 text-white text-sm font-mono">
            {activeIndex + 1} / {images.length}
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="الصورة السابقة"
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white w-12 h-12 flex items-center justify-center transition-colors"
              >
                <ChevronIcon direction="right" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="الصورة التالية"
                className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white w-12 h-12 flex items-center justify-center transition-colors"
              >
                <ChevronIcon direction="left" />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active}
            alt={title}
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
            className="max-w-[96vw] max-h-[92vh] object-contain select-none"
          />
        </div>
      )}
    </>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      {direction === "right" ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
