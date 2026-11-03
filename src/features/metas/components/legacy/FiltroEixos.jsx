import { useEffect, useMemo, useState } from "react";

const colorBackground = {
  "universo sp":          { main: "#3DB54A", light: "#87C98E",},
  "cidade empreendedora": { main: "#0000AB",            light: "#9898CC",},
  "viver sao paulo":      { main: "#F16622",            light: "#D6A790",},
  "capital do futuro":    { main: "#792D49",            light: "#C2849B",},
};

function normalize(texto) { return (texto || "") .normalize("NFD") .replace(/[\u0300-\u036f]/g, "") .toLowerCase() .trim(); }

function getIdForFilter(id) {
  const numberId = Number(id);
  return Number.isNaN(numberId) ? id : numberId;
}

function isSelected(lista = [], id) {
  return Array.isArray(lista) && lista.some((item) => String(item) === String(id));
}

export default function FiltroEixosCards({eixos = [],filtrosSelecionados = {},toggleSelecionado,eixoIdFromNav,subeixoFilterKey = "subeixos",}) {
  const [eixosAbertos, setEixosAbertos] = useState([]);
  const [initialFilterApplied, setInitialFilterApplied] = useState(false);

  const eixoIdFromNavNormalized = useMemo(() => {
    if (eixoIdFromNav == null) return null;
    return getIdForFilter(eixoIdFromNav);
  }, [eixoIdFromNav]);

  const sortedEixos = useMemo(() => {
    if (!Array.isArray(eixos)) return [];

    return [...eixos].sort((a, b) => {
      const idA = Number(a.id);
      const idB = Number(b.id);

      if (!Number.isNaN(idA) && !Number.isNaN(idB)) {
        return idA - idB;
      }

      return String(a.id).localeCompare(String(b.id));
    });
  }, [eixos]);

  useEffect(() => {
    if (eixoIdFromNavNormalized == null || initialFilterApplied) return;
    const idKey = String(eixoIdFromNavNormalized);
    setEixosAbertos((prev) => prev.includes(idKey) ? prev : [...prev, idKey]);
    if (!isSelected(filtrosSelecionados.eixos, eixoIdFromNavNormalized)) { toggleSelecionado("eixos", eixoIdFromNavNormalized); }

    setInitialFilterApplied(true);
    }, [ eixoIdFromNavNormalized, initialFilterApplied, filtrosSelecionados.eixos, toggleSelecionado, ]);

  function toggleDropdown(idKey) {
    setEixosAbertos((prev) =>
      prev.includes(idKey) ? prev.filter((item) => item !== idKey) : [...prev, idKey]);
  }

  if (!Array.isArray(eixos) || eixos.length === 0) {
    return <p className="text-sm text-gray-500">Carregando eixos...</p>;
  }

  return (
    <div className="flex md:flex-wrap lg:flex-row lg:flex-nowrap gap-6 py-6 items-start justify-start w-full px-2">
      {sortedEixos.map(({ nome, id, temas }) => {
        const idForFilter = getIdForFilter(id);
        const idKey = String(idForFilter);
        const isAberto = eixosAbertos.includes(idKey);
        const normalizedNome = normalize(nome);
        const colors = colorBackground[normalizedNome] || { main: "var(--color-navy)", light: "#9CA3AF", };
        const eixoSelecionado = isSelected( filtrosSelecionados.eixos, idForFilter );
        const subeixosSelecionados = filtrosSelecionados[subeixoFilterKey] || [];

        return (
          <article key={idKey} className="w-auto lg:w-1/3 overflow-hidden rounded-lg shadow-md transition-colors duration-500 ease-out md:w-40" style={{ backgroundColor: isAberto ? colors.light : colors.main,}}>
            <div role="button" tabIndex={0} onClick={() => toggleDropdown(idKey)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { toggleDropdown(idKey); } }} className="relative flex h-[6.4rem] w-full cursor-pointer items-center justify-between rounded-lg px-6 py-5" style={{ backgroundColor: colors.main }}>
              <h3 className="w-auto lg:max-w-40 text-left text-xl xl:text-3xl uppercase leading-none text-white"> {nome} </h3>

              <button type="button" aria-label={`Filtrar eixo ${nome}`} aria-pressed={eixoSelecionado} onClick={(event) => { event.stopPropagation(); toggleSelecionado("eixos", idForFilter);}} className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full border-2 border-white transition" style={{ backgroundColor: eixoSelecionado ? "white" : "transparent",}}> 
                <i className="fa-solid fa-check text-white" style={{ color: eixoSelecionado ? colors.main : "white", }}></i>
              </button>
            </div>

            <div  className={`flex flex-col gap-3 px-5 overflow-hidden transition-all duration-300 ease-in-out ${isAberto ? "max-h-[500px] opacity-100 py-4" : "max-h-0 opacity-0 py-0 pointer-events-none"}`}>
                {Array.isArray(temas) && temas.length > 0 ? (
                    temas.map((sub) => { const subIdForFilter = getIdForFilter(sub.id); const subSelecionado = isSelected(subeixosSelecionados, subIdForFilter);
                    return (
                        <button key={sub.id ?? subIdForFilter} type="button" onClick={() => toggleSelecionado(subeixoFilterKey, subIdForFilter)} className="flex w-full items-center justify-between gap-3 text-left text-sm leading-tight text-white transition duration-300 ">
                        <p>{sub.nome}</p>
                        <span className={` grid h-5 w-5 shrink-0 place-items-center rounded-full !border-2 border-white transition ${subSelecionado ? "bg-white" : "bg-transparent"}`}>
                            <i className="fa-solid fa-check" style={{   color: subSelecionado ? colors.main : "white", }}></i>
                        </span>
                        </button>
                    );})
                ) : ( <p className="text-sm text-white"> Nenhum sub-eixo encontrado. </p> )
                }
                </div>
          </article>
        );
      })}
    </div>
  );
}