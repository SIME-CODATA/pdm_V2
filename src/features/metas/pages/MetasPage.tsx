import { lazy, Suspense, useDeferredValue, useMemo, useRef, useState } from 'react'
import {useQuery} from '@tanstack/react-query'
import {MapPinned,BarChart3} from 'lucide-react'
import {useMetas,useMetaMapPayload,useMetaFiltersPayload} from '../hooks/useMetas'
import {emptyFilters,applyBaseFilters} from '../lib/metas.utils'
import type {ActiveFilters} from '../lib/metas.utils'
import {loadTerritories,areaMatches} from '../map/metas.geo'
import type {Bounds} from '../map/metas.geo'
import {MetaCard} from '../components/MetaCard'
import {MetaModal} from '../components/MetaModal'
import {MetasFilters} from '../components/MetasFilters'
import {BudgetPanel} from '../components/BudgetPanel'
import { metasContent } from '../data/metas.content'
import type { MetaSummary } from '../api/metas.schemas'
import type { TerritoryFeature } from '../map/metas.geo'
import './MetasPage.css'
const EMPTY_METAS: MetaSummary[] = []
const EMPTY_FEATURES: TerritoryFeature[] = []
const MetasMap=lazy(()=>import('../map/MetasMap').then(x=>({default:x.MetasMap})))
export function MetasPage(){
 const [filters,setFilters]=useState<ActiveFilters>({...emptyFilters}),[selectedCode,setSelectedCode]=useState<string|null>(null),[mode,setMode]=useState<'map'|'stats'>('map')
 const [bounds,setBounds]=useState<Bounds|null>(null),[resetKey,setResetKey]=useState(0)
 const [activeCode,setActiveCode]=useState<string|null>(null)
 const listRef=useRef<HTMLDivElement>(null)
 const deferred=useDeferredValue(filters)
 const {data,isPending,error,refetch}=useMetas()
 const mapPayload=useMetaMapPayload();useMetaFiltersPayload() // cache separado para validar esquema real do endpoint
 const territories=useQuery({queryKey:['pdm-v2','territories',mapPayload.data],queryFn:({signal})=>loadTerritories(mapPayload.data,signal),staleTime:600_000,retry:0})
 const metas=data?.metas??EMPTY_METAS
 const filtered=useMemo(()=>applyBaseFilters(metas,deferred),[metas,deferred])
 const features=territories.data?.features??EMPTY_FEATURES
 const visible=useMemo(()=>filtered.filter(meta=>{
  if(filters.regional==='nonregionalized') return true
  return areaMatches(meta,features,bounds)
 }),[filtered,features,bounds,filters.regional])
 const selected=metas.find(m=>m.codigo===selectedCode)??null
 const withTerritories=metas.filter(m=>m.regionalizada&&m.subprefeituras.length).length
 function reset(){setBounds(null);setResetKey(x=>x+1)}
 function selectPin(code:string){
  const next = activeCode===code ? null : code
  setActiveCode(next)
  if (next) requestAnimationFrame(()=>{
   listRef.current?.querySelector<HTMLElement>(`[data-meta-code=\"${next}\"]`)
    ?.scrollIntoView({behavior:'smooth',block:'nearest'})
  })
 }
 function openMeta(code:string){setActiveCode(code);setSelectedCode(code)}
 return <div className="metas-page">
  <header className="metas-page__header"><h1 className="font-display text-primary">{metasContent.title}</h1><p>{metasContent.description}</p></header>
  <section className="metas-page__workspace" aria-labelledby="metas-map-title">
   <div className="metas-page__heading"><h2 id="metas-map-title">{metasContent.mapTitle}</h2><div className="metas-page__switch" role="group" aria-label="Modo de visualização"><button type="button" aria-label="Visualizar mapa" aria-pressed={mode==='map'} onClick={()=>setMode('map')}><MapPinned/></button><button type="button" aria-label="Visualizar resumo" aria-pressed={mode==='stats'} onClick={()=>setMode('stats')}><BarChart3/></button></div></div>
   <div className="metas-page__grid">
    <section className="metas-page__map-panel" aria-label="Mapa e estatísticas">
     {mode==='map'?<><div className="metas-page__map-shell"><Suspense fallback={<div className="metas-page__map-loading">Carregando mapa…</div>}><MetasMap metas={filtered} features={features} activeCode={activeCode} onBounds={setBounds} onSelect={selectPin} resetKey={resetKey}/></Suspense></div>
      <div className="metas-page__map-footer"><button type="button" className="metas-page__map-action" onClick={reset}>Ver São Paulo inteira</button><span>{bounds?'Área visível: a listagem acompanha o mapa':'Todas as áreas · selecione o número de uma meta'}</span></div>
      {territories.data?.source==='reference'&&<p className="metas-page__map-warning">Pins em pontos aproximados das subprefeituras. Sem polígonos oficiais, o filtro espacial por zoom também é aproximado. Adicione o GeoJSON validado do GeoSampa para precisão territorial.</p>}
      {territories.isError&&<p className="metas-page__map-warning" role="alert">{metasContent.noGeo}</p>}
     </>:<div className="metas-page__stats"><h3 className="font-display">Visão geral</h3><div><strong>{metas.length}</strong> metas no índice</div><div><strong>{metas.filter(m=>!m.regionalizada).length}</strong> não regionalizáveis</div><div><strong>{withTerritories}</strong> com território informado</div><div><strong>{metas.filter(m=>m.regionalizada&&!m.subprefeituras.length).length}</strong> regionalizáveis ainda sem território</div><BudgetPanel/></div>}
    </section>
    <aside className="metas-page__sidebar"><MetasFilters metas={metas} value={filters} onChange={setFilters}/><div className="metas-page__list-heading"><span>{visible.length} metas exibidas</span><span>{data?`${data.total} no total`:''}</span></div><div className="metas-page__list" ref={listRef} aria-live="polite">
     {isPending?<p className="metas-page__feedback">Consultando nova API…</p>:error?<div className="metas-page__feedback" role="alert"><p>{error.message}</p><button onClick={()=>void refetch()} type="button">Tentar novamente</button></div>:visible.length?visible.map(meta=><MetaCard key={meta.codigo} meta={meta} selected={activeCode===meta.codigo} onOpen={openMeta}/>):<p className="metas-page__feedback">{metasContent.noResults}</p>}
    </div></aside>
   </div>
  </section>
  <MetaModal summary={selected} onClose={()=>setSelectedCode(null)}/>
 </div>
}
export default MetasPage
