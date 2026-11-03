import { useSectionsCarousel } from "./hooks/useSectionsCarousel";

export default function MobileSectionsCarousel({ sections }) {
  const { containerRef, registerItemRef, activeIndex, scrollToIndex } =
    useSectionsCarousel(sections?.length ?? 0);

  if (!sections?.length) return null;

  return (
    <div className="md:hidden">
      {/* Tabs (pílulas) */}
      <div className="px-4">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-3">
          {sections.map((s, idx) => {
            const isActive = idx === activeIndex;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollToIndex(idx)}
                className={[
                  "shrink-0 rounded-full px-3 py-2 text-[11px] uppercase tracking-wide",
                  "transition-colors duration-200",
                  isActive ? "text-white shadow-[0_4px_11px_0_#00000061]" : "bg-white",
                ].join(" ")}
                style={{
                  backgroundColor: isActive ? "#292561" : "transparent",
                  borderColor: isActive ? "transparent" : "#E5E7EB",
                  color: isActive ? "#FFFFFF" : "#374151",
                }}
                aria-current={isActive ? "true" : "false"}
              >
                <p className="text-[9px]" dangerouslySetInnerHTML={{ __html: s.label }}/>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards (carrossel) */}
      <div
        ref={containerRef}
        className={[
          "mt-1 flex gap-4 px-4 pb-6",
          "overflow-x-auto no-scrollbar",
          "snap-x snap-mandatory",
          "scroll-px-4",
        ].join(" ")}
      >
        {sections.map((s, idx) => {
          const isActive = idx === activeIndex;

          return (
            <div
              key={s.id}
              ref={registerItemRef(idx)}
              className={[
                "snap-center shrink-0",
                "w-[86vw] max-w-[520px] h-full",
                "rounded-[22px] bg-white",
                "shadow-[0_8px_22px_rgba(0,0,0,0.08)]",
                "!border-3 transition-[border-color,transform] duration-200",
                isActive ? "translate-y-0 " : "translate-y-[1px]",
              ].join(" ")}
              style={{
                borderColor: isActive ? s.color : "#E5E7EB",
              }}
            >
              <div className="p-4">{s.content}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}