import { useState } from "react";

function normalize(s) {
    return (s || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function ToggleMapa({ checked, onChange, color = "#CEFA05" }) {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className="w-10 h-6 lg:w-16 lg:h-8 rounded-full duration-300 " style={{ boxShadow: `0px 0px 17px 3px color-mix(in srgb, ${color}, black 40%) inset`, lineHeight: 1 }}></div>
            <span className="w-4 h-4 absolute top-1 lg:left-1 lg:h-6 lg:w-6 rounded-full duration-300 peer-checked:translate-x-5 lg:peer-checked:translate-x-8 peer-hover:scale-95" style={{ backgroundColor: "white", }} />
        </label>
    );
}

export default function MetaModalRegionalizacao({ meta }) {
    const [isExecutada, setIsExecutada] = useState(true);
    const card = meta?.card;
    const corPrincipal = card?.eixo_cor_principal || "#16A34A";
    const metamap = card?.regionalizacao_metamap || {};
    const planejado = card?.regionalizacao_planejado || {};
    const executado = card?.regionalizacao_executado || {};

    if (!metamap.status_regionalizacao) return null;

    const status = normalize(metamap.status_regionalizacao);
    const isNaoRegionalizavel = status === "nao regionalizavel";
    const nota = metamap.nota_regionalizacao || null;

    const urlPlanejada = planejado.map_image;
    const urlExecutada = executado.map_image;

    const legenda = isExecutada ? executado.map_legenda : planejado.map_legenda;

    const showToggle = !isNaoRegionalizavel;
    const imageCandidate = isExecutada ? urlExecutada : urlPlanejada;
    const activeUrl = typeof imageCandidate === "string" && /^https?:\/\//.test(imageCandidate) ? imageCandidate : null;

    return (
        <div className="w-full bg-white flex flex-col gap-2 lg:gap-5">
            <span className="block w-full h-0.5" style={{ background: corPrincipal }} />
            <div className="flex items-center justify-between px-2 pt-3">
                <h3 className="text-base font-semibold uppercase tracking-wide pl-3 lg:text-4xl" style={{ color: corPrincipal }}>
                    Regionalização
                </h3>
            </div>

            <div className="px-2 pt-3">
                <p className="font-bold text-sm capitalize text-gray-700">
                    {metamap.status_regionalizacao}
                </p>
                {nota ? (
                    <p className="font-semibold text-sm text-gray-700 mt-2">{nota}</p>
                ) : null}
            </div>

            {!isNaoRegionalizavel ? (
                <div className="flex flex-col justify-center items-center w-full mt-4">
                    <div className="flex flex-col items-end justify-center w-full lg:items-start">
                        {/* TOGGLE */}
                        <div className="flex items-center justify-center gap-3 px-6 py-2 rounded-t-xl text-white font-bold text-xs uppercase shadow-sm z-10 relative right-4 lg:left-15" style={{ backgroundColor: corPrincipal }}>
                            <span className={`transition-opacity duration-300 ${!isExecutada ? 'opacity-100' : 'opacity-50'}`}>
                                <p className="text-[7px] md:text-xs uppercase">Planejada</p>
                            </span>
                            {showToggle ? (
                                <ToggleMapa checked={isExecutada} onChange={setIsExecutada} color={corPrincipal} />
                            ) : null}
                            <span className={`transition-opacity duration-300 ${isExecutada ? 'opacity-100' : 'opacity-50'}`}>
                                <p className="text-[7px] md:text-xs uppercase">Executada</p>
                            </span>
                        </div>
                        <div className="w-full relative -mt-[1px] lg:rounded-[49px] rounded-2xl shadow-[inset_0_0_15px_2px_#0000004a] overflow-hidden bg-gray-50">
                            {activeUrl ? (
                                <><img src={activeUrl} alt={`Mapa de regionalização ${isExecutada ? "executada" : "planejada"}`} className="w-full h-auto object-contain" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.nextElementSibling?.classList.remove("hidden"); }} /><div className="hidden w-full h-60 flex-col items-center justify-center text-gray-500"><span>Em manutenção</span></div></>
                            ) : (
                            <div className="w-full h-60 flex flex-col items-center justify-center text-gray-400">
                                <i className="fa-regular fa-image text-4xl mb-2"></i>
                                <span className="font-medium text-sm uppercase tracking-wider">Em manutenção</span>
                            </div>
)}
                        </div>
                    </div>
                </div>
            ) : null}
            {legenda ? (
                <div className="px-2 pt-3">
                    <figcaption className="text-xs text-center underline text-gray-700">
                        {legenda}
                    </figcaption>
                </div>
            ) : null}
        </div>
    );
}