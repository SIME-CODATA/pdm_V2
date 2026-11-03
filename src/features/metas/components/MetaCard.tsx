import type {MetaSummary} from '../api/metas.schemas'
import {axisColor,territorialStatus} from '../lib/metas.utils'
import {metasContent} from '../data/metas.content'
export function MetaCard({meta,onOpen,selected=false}:{meta:MetaSummary,onOpen:(code:string)=>void,selected?:boolean}){
 const status=territorialStatus(meta)
 return <button type="button" onClick={()=>onOpen(meta.codigo)} className={`metas-card${selected?' metas-card--selected':''}`} data-meta-code={meta.codigo} aria-pressed={selected} style={{backgroundColor:!meta.regionalizada?metasContent.nonRegionalizedTint:undefined}}>
  <span className="metas-card__number" style={{color:axisColor(meta)}}>{meta.numero.padStart(2,'0')}</span>
  <span className="metas-card__body"><span className="metas-card__chips"><span className="metas-card__chip" style={{backgroundColor:axisColor(meta)}}>{meta.eixo.nome}</span>{status==='nonregionalized'&&<span className="metas-card__chip metas-card__chip--muted">Não regionalizável</span>}{status==='without-territory'&&<span className="metas-card__chip metas-card__chip--muted">Sem território cadastrado</span>}</span>
  <span className="metas-card__description">{meta.titulo}</span><span className="metas-card__orgs">{meta.subprefeituras.length?meta.subprefeituras.slice(0,3).join(' · '):meta.regionalizada?'Localização territorial pendente':'Abrangência municipal'}</span></span>
 </button>
}
