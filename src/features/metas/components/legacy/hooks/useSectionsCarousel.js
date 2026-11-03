import { useCallback, useEffect, useRef, useState } from "react";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export function useSectionsCarousel(count) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Ajusta tamanho do array de refs
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, count);
  }, [count]);

  const registerItemRef = useCallback(
    (index) => (el) => {
      itemRefs.current[index] = el;
    },
    []
  );

  const scrollToIndex = useCallback(
    (index, behavior = "smooth") => {
      const i = clamp(index, 0, count - 1);
      const el = itemRefs.current[i];
      if (!el) return;

      el.scrollIntoView({
        behavior,
        inline: "center",
        block: "nearest",
      });

      setActiveIndex(i);
    },
    [count]
  );

  const rafId = useRef(null);

  const computeActiveFromCenter = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const cRect = container.getBoundingClientRect();
    const cCenter = cRect.left + cRect.width / 2;

    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < count; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const center = r.left + r.width / 2;
      const dist = Math.abs(center - cCenter);

      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }

    setActiveIndex((prev) => (prev === best ? prev : best));
  }, [count]);

  const onScroll = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(computeActiveFromCenter);
  }, [computeActiveFromCenter]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", onScroll, { passive: true });
    computeActiveFromCenter();

    return () => {
      container.removeEventListener("scroll", onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [onScroll, computeActiveFromCenter]);

  return { containerRef, registerItemRef, activeIndex, scrollToIndex };
}