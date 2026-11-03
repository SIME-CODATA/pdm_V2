import { CircleDollarSign, FileSearch, Eye } from 'lucide-react'
import { aboutContent } from '../data/about.content'
import { AssetVisual } from '../components/AssetVisual'
import { EdgeSectionTag } from '../components/EdgeSectionTag'
import { TimelineSection } from './TimelineSection'

import './ConstructionSection.css'

const icons = [FileSearch, Eye, CircleDollarSign] as const

export function ConstructionSection() {
  const { construction } = aboutContent
  return (
    <section
      aria-labelledby="about-construction-title"
      className="about-construction relative pt-10 pb-16 sm:pt-14"
    >
      <EdgeSectionTag title={construction.label} />
      <div className="about-page-width">
        <h2
          id="about-construction-title"
          className="font-display text-home-documents max-w-140 text-4xl leading-none sm:text-5xl"
        >
          {construction.title}
        </h2>
      </div>
      <div className="about-construction__feature about-page-width mt-7">
        <div className="about-construction__copy">
          <ul className="mb-9 grid gap-4 text-white">
            {construction.benefits.map((benefit, index) => {
              const Icon = icons[index]
              return (
                <li
                  key={benefit}
                  className="flex items-center gap-4 font-sans text-sm leading-tight font-semibold uppercase sm:text-base"
                >
                  <Icon size={28} aria-hidden="true" />
                  {benefit}
                </li>
              )
            })}
          </ul>
          <strong className="block max-w-70 text-sm">{construction.lead}</strong>
          <p className="mt-3 max-w-85 text-sm leading-relaxed">{construction.description}</p>
        </div>
        <AssetVisual
          src={construction.imageUrl}
          alt="Capa ilustrativa do Programa de Metas 2025/2028"
          className="about-construction__cover"
          imageClassName="object-contain"
          fallback
        />
      </div>
      <TimelineSection />
    </section>
  )
}
