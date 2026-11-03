import { useCallback } from "react";

export default function DesktopSectionsLayout({ sections, monitoramentoId = "monitoramento", color }) {
  const hexToRgba = useCallback((hex, alpha) => {
        if (!hex) return "transparent";
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }, []);

  const monitoramento = sections.find((s) => s.id === monitoramentoId);
  const rest = sections.filter((s) => s.id !== monitoramentoId);
  const bgDesktop = hexToRgba(color, 0.08);

  return (
    <section className="hidden md:block mt-10">
      <div className="px-6" style={{ maxWidth: "1800px", margin: "0 auto" }}>
        <div className="grid grid-cols-12 gap-6">
            <main className={monitoramento ? "col-span-8 lg:w-4/5" : "col-span-12"}>
            <div className="flex flex-col gap-6">
              {rest.map((s) => (
                <article key={s.id} className="rounded-2xl border bg-white" style={{ borderColor: "#E5E7EB" }}>
                  {s.content}
                </article>
              ))}
            </div>
          </main>
          {monitoramento && (
            <aside className="col-span-4 relative bottom-60">
              <div className="sticky pt-6 top-6">
                <div style={{ '--bg-desktop': bgDesktop }} className="rounded-2xl  bg-white p-4 shadow-xl lg:bg-[var(--bg-desktop)] w-full h-full">
                  <h4 className="text-lg font-bold uppercase mb-3 md:text-4xl pt-3" style={{ color: monitoramento.color }} >
                    {monitoramento.label}
                  </h4>
                  {monitoramento.content}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}