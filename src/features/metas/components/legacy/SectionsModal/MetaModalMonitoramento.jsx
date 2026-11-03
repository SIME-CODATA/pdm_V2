import { useState } from 'react';

export default function MetaModalMonitoramento({ meta }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    if (!meta || !meta.card) return null;
    const { card } = meta;
    const corPrincipal = card.eixo_cor_principal || "#2E7D32";
    const statusDaApi = card.monitoramento || "planejamento";
    let stepAtual = 0;
    const statusLimpo = statusDaApi.toLowerCase();
    if (statusLimpo.includes("progresso")) stepAtual = 1;
    if (statusLimpo.includes("atingida")) stepAtual = 2;
    const steps = [
        { label: "Em Planejamento", isLast: false },
        { label: "Em Progresso", isLast: false },
        { label: "Atingida", isLast: true }
    ];
    const resultados = card.resultados_apurados?.valor || [];
    const temVarios = resultados.length > 1;
    const resultadoExibido = resultados.length > 0 ? resultados[currentIndex] : null;
    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? resultados.length - 1 : prev - 1));
    };
    const handleNext = () => {
        setCurrentIndex((prev) => (prev === resultados.length - 1 ? 0 : prev + 1));
    };

    const formatValorSeguro = (valor) => {
        if (valor === null || valor === undefined) return "";
        if (typeof valor === "number") { return valor.toLocaleString("pt-BR");}
        if (valor instanceof Date) { return valor.toLocaleDateString("pt-BR");}
        if (typeof valor === "string") {return valor.trim() !== "" ? valor : "-";}
        if (typeof valor === "object") { try {return JSON.stringify(valor); } catch {return "";} }
        return String(valor);
    };

    return (
        <div className="flex flex-col w-full py-4 transition-colors">
            <div className="md:hidden w-full flex flex-col">
                <span className="w-full h-0.5" style={{ background: corPrincipal }} />
                <p className="uppercase text-xs pl-2 my-1" style={{ color: corPrincipal }}>
                    status: <strong> META {steps[stepAtual].label}</strong>
                </p>
                <span className="w-full h-0.5 mb-2" style={{ background: corPrincipal }} />
            </div>
            <div className="hidden md:flex flex-col w-full mb-8">
                <div className="relative w-full flex items-center justify-between bg-white px-10 py-8 rounded-2xl shadow-sm mb-6">
                    <div className="absolute top-1/2 left-10 right-10 h-[2px] bg-gray-200 -translate-y-1/2">
                        <div className="h-full transition-all duration-700 ease-in-out"
                            style={{
                                width: stepAtual === 0 ? "0%" : stepAtual === 1 ? "50%" : "100%",
                                background: corPrincipal
                            }}
                        ></div>
                    </div>
                    {steps.map((step, index) => {
                        const isCompleted = index <= stepAtual;
                        const nodeColor = isCompleted ? corPrincipal : "#D1D5DB"; 
                        const textColor = isCompleted ? corPrincipal : "#9CA3AF";
                        return (
                            <div key={index} className="relative flex flex-col items-center gap-2 z-10 bg-white px-2">
                                {step.isLast ? (
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white transition-colors duration-700" style={{ background: nodeColor }} >
                                        <i className="fa-solid fa-check text-[10px]"></i>
                                    </div>
                                ) : (
                                    <div className="w-4 h-4 rounded-full transition-colors duration-700" style={{ background: nodeColor }}></div>
                                )}
                                <span className="absolute top-6 text-[9px] font-bold uppercase whitespace-nowrap transition-colors duration-700" style={{ color: textColor }}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <span className="hidden md:block w-full h-[2px] mb-6" style={{ background: corPrincipal }} />
            <section className="!flex flex-col gap-5 py-3 md:py-0 w-full">
                <div className="!flex flex-row items-center justify-between gap-4 md:gap-10">
                    <h2 className="uppercase text-base md:text-4xl font-bold md:w-1/3" style={{ color: corPrincipal }}>
                        Resultados Apurados
                    </h2>
                    <div className="w-full md:w-2/3 md:max-w-xs flex flex-col rounded-xl overflow-hidden shadow-sm">
                        <div className="w-full flex items-center justify-between py-2 bg-white px-2 text-[10px] md:text-xs font-bold uppercase" style={{ color: corPrincipal }}>
                            {temVarios ? (
                                <button onClick={handlePrev} className="px-2 py-1 hover:bg-black/5 rounded transition-colors" aria-label="Resultado anterior">
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                            ) : <div className="w-6 px-2"></div>}
                            <span className="text-center flex-1">
                                {resultadoExibido ? `${resultadoExibido.mes}/${resultadoExibido.ano}` : "Item não cadastrado"}
                            </span>
                            {temVarios ? (
                                <button onClick={handleNext} className="px-2 py-1 hover:bg-black/5 rounded transition-colors" aria-label="Próximo resultado">
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            ) : <div className="w-6 px-2"></div>}
                        </div>
                        <div className="normal-case w-full text-center py-5 md:py-6 text-2xl md:text-2xl font-bold text-white transition-all duration-300 break-all" style={{ background: corPrincipal }} >{formatValorSeguro(resultadoExibido?.resultados_apurados_value)}</div>
                            
                    </div>
                </div>
                <span className="w-full border-t border-dotted md:border-solid md:border-t-2 my-2" style={{ borderColor: corPrincipal }} />
                <div className="flex flex-col md:flex-row justify-between w-full items-start md:items-center gap-2 md:gap-10">
                    <h3 className="uppercase text-base md:text-4xl font-bold md:w-1/3" style={{ color: corPrincipal }}>
                        Indicador
                    </h3>
                    <p className="text-sm md:text-lg font-medium text-gray-900 md:w-2/3 break-words">
                        {card.indicador?.valor || "Item não cadastrado/informado"}
                    </p>
                </div>
                <span className="w-full h-[2px] my-2 md:my-6" style={{ background: corPrincipal }} />
                <div className="flex flex-col items-start gap-4 md:gap-6">
                    <h2 className="uppercase text-base md:text-4xl font-bold" style={{ color: corPrincipal }}>
                        Evolução da Meta
                    </h2>
                    <p className="text-sm md:text-base leading-relaxed text-gray-800">
                        {card.evolucao || "Item não cadastrado/informado"}
                    </p>
                </div>
            </section>
        </div>
    )
}