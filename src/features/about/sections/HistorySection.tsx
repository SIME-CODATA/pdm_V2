import { aboutContent } from '../data/about.content'
import { AboutAction } from '../components/AboutAction'
import { AssetVisual } from '../components/AssetVisual'

import './HistorySection.css'

export function HistorySection() {
  const { history } = aboutContent
  return (
    <section aria-label="Histórico do Programa de Metas" className="about-history pt-6 pb-24">
      <div className="about-history__banner">
        <AssetVisual
          src={history.imageUrl}
          alt=""
          className="absolute inset-0"
          fallback={
            <div className="via-home-documents h-full w-full bg-linear-to-r from-[#0079ab] to-[#025676]" />
          }
        />
        <div className="about-page-width relative z-10 py-7">
          <h2 className="font-display max-w-lg text-3xl leading-snug text-white sm:text-4xl">
            {history.banner}
          </h2>
        </div>
      </div>
      <div className="about-history__content about-page-width mt-12">
        <div className="max-w-xl">
          <p className="font-semibold">{history.lead}</p>
          <p className="mt-5 leading-relaxed">{history.paragraph}</p>
        </div>
        <div className="flex flex-col justify-center gap-4">
          <p className="text-accent max-w-xs text-sm font-medium">{history.callout}</p>
          <AboutAction href={history.href} arrow className="max-w-75">
            {history.button}
          </AboutAction>
        </div>
      </div>
    </section>
  )
}
