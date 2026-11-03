import { aboutContent } from '../data/about.content'
import { AboutAction } from '../components/AboutAction'
import { AssetVisual } from '../components/AssetVisual'
import { EdgeSectionTag } from '../components/EdgeSectionTag'

import './MonitoringSection.css'

export function MonitoringSection() {
  const { monitoring } = aboutContent
  return (
    <section aria-label="Monitoramento das metas" className="about-monitoring relative pt-20 pb-24">
      <EdgeSectionTag title={monitoring.label} />
      <div className="about-monitoring__background">
        <div className="about-monitoring__layout about-page-width">
          <AssetVisual
            src={monitoring.imageUrl}
            alt="Painel de acompanhamento do Programa de Metas em um notebook"
            className="about-monitoring__laptop"
            imageClassName="object-contain"
            fallback={
              <div className="about-monitoring__mock">
                <div className="about-monitoring__mock-screen">
                  <span className="text-[10px] font-bold text-green-600">METAS</span>
                  <p className="mt-2 text-xs font-bold text-green-700">
                    MONITORAMENTO DE RESULTADOS
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded bg-green-50 p-3">
                      <div className="h-2 w-full bg-green-200" />
                      <div className="mt-3 h-2 w-4/5 bg-green-100" />
                      <div className="mt-3 h-2 w-3/4 bg-green-100" />
                    </div>
                    <div className="rounded bg-green-50 p-3">
                      <div className="h-2 w-3/4 bg-green-200" />
                      <div className="mt-3 h-4 bg-green-500" />
                    </div>
                  </div>
                </div>
                <div className="about-monitoring__mock-base" />
              </div>
            }
          />
          <div className="about-monitoring__text">
            <p className="max-w-md font-sans text-base leading-snug font-semibold">
              {monitoring.lead}
            </p>
            <AboutAction href={monitoring.firstHref} arrow className="mt-4 w-full max-w-80">
              {monitoring.firstButton}
            </AboutAction>
            <h2 className="mt-8 text-xl font-medium text-[#0079ab] uppercase">
              {monitoring.title}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed font-semibold text-[#0079ab]">
              {monitoring.description}
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed">{monitoring.complement}</p>
            <AboutAction
              href={monitoring.secondHref}
              variant="light"
              className="mt-6 w-full max-w-85 rounded-4xl! font-sans text-[#43C3D3]!"
            >
              {monitoring.secondButton}
            </AboutAction>
          </div>
        </div>
      </div>
    </section>
  )
}
