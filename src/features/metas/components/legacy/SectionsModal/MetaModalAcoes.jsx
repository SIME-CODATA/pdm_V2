import { useState, useCallback } from 'react';

export default function MetaModalAcoesEstrategicas({ meta }) {
    const [openIndex, setOpenIndex] = useState(null);
    const hexToRgba = useCallback((hex, alpha) => {
        if (!hex) return "transparent";
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }, []);

    if (!meta || !meta.card) return null;

    const corPrincipal = meta.card.eixo_cor_principal || "#2E7D32";
    const bgLight = hexToRgba(corPrincipal, 0.08);

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };
    const acoes = meta.card.acoes_estrategicas?.valor || [];

    if (acoes.length === 0) return null;

    return (
        <div className="flex flex-col md:flex-row w-full gap-6 md:gap-10 py-6 !border-t-4" style={{ borderColor: corPrincipal }}>
            <div className="w-full md:w-1/3 flex flex-row md:flex-col items-start justify-between md:justify-start gap-2 md:pr-6 lg:relative lg:left-4">
                <h2 className="uppercase text-xl md:text-4xl font-bold leading-tight" style={{ color: corPrincipal }}>
                    Ações<br/> Estratégicas
                </h2>
                <div className="flex flex-col items-end md:items-start gap-1 md:mt-8">
                    <span className="text-[10px] md:text-sm font-medium" style={{ color: corPrincipal }}>Legenda:</span>
                    <div className="flex items-center gap-2 mt-1 lg:flex-row-reverse">
                        <span className="text-xs md:text-sm" style={{ color: corPrincipal }}>Concluída</span>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ background: corPrincipal }}>
                            <i className="fa-solid fa-check text-[10px]"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="w-full md:w-2/3 flex flex-col rounded-xl overflow-hidden shadow-sm lg:relative lg:bottom-6" style={{ backgroundColor: bgLight }}>
                {acoes.map((acao, index) => {
                    const isOpen = openIndex === index;
                    
                    // Lógica para verificar se há algum texto de evolução (independente de estar concluída ou não)
                    const temEvolucao = acao.evolucao_negrito || acao.descricao_evolucao;

                    return (
                        <div key={index} className={`flex flex-col w-full lg:!border-b ${index === 0 ? 'border-t' : ''}`} style={{ borderColor: corPrincipal }}>
                            <button onClick={() => toggleAccordion(index)} className="flex flex-row items-center justify-between w-full p-4 md:p-6 text-left transition-colors hover:bg-black/5" >
                                <span className="text-sm md:text-base font-medium pr-4 text-gray-900 leading-snug">
                                    {acao.numero} - {acao.descricao}
                                </span>
                                <div className="flex items-center gap-3 shrink-0">
                                    {acao.concluida && (
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm" style={{ background: corPrincipal }}>
                                            <i className="fa-solid fa-check text-xs"></i>
                                        </div>
                                    )}
                                    <div className="w-7 h-7 rounded-full flex flex-col items-center justify-center flex-nowrap border-2 transition-transform duration-300"  style={{  borderColor: corPrincipal,  color: corPrincipal,  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} >
                                        <i className={`fa-solid ${isOpen ? 'fa-minus' : 'fa-plus'} text-xs p-1 !border rounded-full text-center`}></i>
                                    </div>
                                </div>
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-4 md:p-6 pt-0 text-sm md:!text-base text-gray-700">
                                    {temEvolucao ? (
                                        <>
                                            {acao.evolucao_negrito && <strong className="block">{acao.evolucao_negrito}</strong>}
                                            {acao.descricao_evolucao && <p className="!text-base">{acao.descricao_evolucao}</p>}
                                        </>
                                    ) : (
                                        acao.concluida ? (
                                            <p>Ação concluída.</p>
                                        ) : (
                                            <p className="italic text-gray-500">Esta ação ainda não foi concluída.</p>
                                        )
                                    )}

                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}