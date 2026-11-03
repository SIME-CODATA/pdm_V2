import { useMemo } from "react";
import { useCardMetasModal } from "./hooks/useCardMetasModal";
import MetaModalHeader from "./SectionsModal/MetaModalHeader";
import MetaModalTitle from "./SectionsModal/MetaModalTitle";
import MetaModalContent from "./SectionsModal/MetaModalContent";
import Regionalizacao from "./SectionsModal/MetaModalRegionalizacao";
import MetaModalFooter from "./SectionsModal/MetaModalFooter";
import MetaModalAcoesEstrategicas from "./SectionsModal/MetaModalAcoes";
import MetaModalMonitoramento from "./SectionsModal/MetaModalMonitoramento";
import MobileSectionsCarousel from "./MobileSectionsCarousel";
import DesktopSectionsLayout from "./DesktopSectionsLayout";

const hasAcoes = (meta) =>
  Array.isArray(meta?.card?.acoes_estrategicas?.valor) &&
  meta.card.acoes_estrategicas.valor.length > 0;

const normalize = (s) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// NOVO: Verifica as novas chaves de regionalização
const hasRegionalizacao = (meta) => {
  const statusMap = meta?.card?.regionalizacao_metamap?.status_regionalizacao;
  if (!statusMap) return false;

  const status = normalize(statusMap);
  return status !== "nao regionalizavel";
};

export default function MetaModal({ meta, onClose }) {
  const { handleClose, parsedTitle } = useCardMetasModal(meta, onClose);
  const color = meta?.card?.eixo_cor_principal;

  const sections = useMemo(() => {
    if (!meta) return [];

    const all = [
      { id: "monitoramento", label: "Monitoramento", color, content: <MetaModalMonitoramento meta={meta} />, enabled: true, },
      { id: "projecao-orgao", label: "Projeção e<br/> Órgão", color, content: <MetaModalContent meta={meta} />, enabled: true, },
      { id: "acoes", label: "Ações<br/> Estratégicas", color, content: <MetaModalAcoesEstrategicas meta={meta} />, enabled: hasAcoes(meta), },
      { id: "regionalizacao", label: "Regionalização", color, content: <Regionalizacao meta={meta} />, enabled: hasRegionalizacao(meta), },
    ];

    return all.filter((s) => s.enabled);
  }, [meta, color]);

  if (!meta) return null;

  return (
    <div className="pdm-meta-legacy__content bg-white w-full min-h-full">
      <MetaModalHeader meta={meta} onClose={handleClose} />
      <MetaModalTitle meta={meta} title={parsedTitle} color={color} />
      <div className="md:hidden">
        <MobileSectionsCarousel sections={sections} />
      </div>
      <div className="hidden md:block lg:relative lg:bottom-10">
        <DesktopSectionsLayout color={color} sections={sections} monitoramentoId="monitoramento" />
      </div>
      <MetaModalFooter card={meta.card} />
    </div>
  );
}