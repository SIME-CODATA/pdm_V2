import { useState } from 'react'
import { Bus, Construction, House, Leaf, Building2 } from 'lucide-react'
import type { CSSProperties } from 'react'

import { aboutContent } from '../data/about.content'
import type { AxisIconKey } from '../data/about.content'
import { EdgeSectionTag } from '../components/EdgeSectionTag'
import { AboutAction } from '../components/AboutAction'

import './AxesSection.css'

const icons = {leaf: Leaf, home: House, building: Building2, bus: Bus, construction: Construction,} satisfies Record<AxisIconKey, typeof Leaf>

export function AxesSection() {
  const { axes } = aboutContent
  const [selectedId, setSelectedId] = useState<string>(axes.initialAxis)
  const activeAxis = axes.items.find((axis) => axis.id === selectedId) ?? axes.items[0]

  return (
    <section aria-labelledby="about-axes-title" className="about-axes relative pt-4 pb-16 sm:pt-10">
      <EdgeSectionTag title={axes.label} />
      <div className="about-page-width">
        <h2 id="about-axes-title" className="font-display text-4xl text-home-documents sm:text-5xl">{axes.title}</h2>
        <p className="mt-2 max-w-xl font-sans text-base leading-snug text-primary">{axes.subtitle}</p>

        <div role="group" aria-label="Escolha um eixo do programa" className="about-axes__tabs mt-6">
          {axes.items.map((axis) => (
            <button key={axis.id} id={`axis-tab-${axis.id}`} type="button" aria-pressed={selectedId === axis.id} aria-controls="axis-panel" onClick={() => setSelectedId(axis.id)} className="about-axes__tab" style={{ '--axis-color': axis.color } as CSSProperties}>
              {axis.tabLabel}
            </button>
          ))}
        </div>
      </div>

      <div className="about-axes__stack mt-9" role="group" aria-label="Painéis dos eixos">
        {axes.items.map((axis) => {
          const active = axis.id === selectedId
          return (
            <div key={axis.id} className={`about-axes__item ${active ? 'about-axes__item--active' : ''}`} style={{ '--axis-color': axis.color } as CSSProperties}>
              <button type="button" aria-label={`Exibir eixo ${axis.tabLabel}`} aria-pressed={active} onClick={() => setSelectedId(axis.id)} className="about-axes__rail">
                <span className="sr-only">{axis.tabLabel}</span>
              </button>
              {active && (
                <div id="axis-panel" role="region" aria-labelledby={`axis-tab-${axis.id}`} className="about-axes__panel about-page-width">
                  <div className="flex flex-col justify-between gap-8">
                    <h3 className="max-w-sm font-display text-4xl leading-[1.12] text-white sm:text-5xl">
                      {activeAxis.headline}
                    </h3>
                    <AboutAction href={activeAxis.href} variant="outline" className="self-start">Veja as metas</AboutAction>
                  </div>
                  <div className="flex flex-col gap-6 text-white">
                    <p className="max-w-md text-sm leading-relaxed sm:text-base">{activeAxis.description}</p>
                    {activeAxis.topics.length > 0 && (
                      <ul className="grid gap-3" aria-label="Temas deste eixo">
                        {activeAxis.topics.map((item) => { const Icon = icons[item.icon]
                          return (
                            <li key={item.label} className="flex items-center gap-3 text-sm font-medium uppercase text-white/90">
                              <Icon size={22} aria-hidden="true" />
                              {item.label}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
