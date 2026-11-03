import { useState } from 'react'
import type { ChangeEvent, CSSProperties } from 'react'
import { FileDown } from 'lucide-react'

import plusPing from '@/assets/icons/Plus_ping.svg'
import { aboutContent } from '../data/about.content'
import type { TimelineDocument } from '../data/about.content'

import './TimelineSection.css'

function TimelineDocumentAction({ document }: { document: TimelineDocument }) {
  const content = (
    <>
      <FileDown aria-hidden="true" size={17} />
      {document.buttonLabel}
    </>
  )
  const classes =
    'mt-4 flex w-full items-center justify-center gap-2 rounded bg-white px-4 py-3 text-center text-xs font-semibold text-[#0079ab]'
  if (!document.url)
    return (
      <button
        disabled
        type="button"
        title="Documento ainda não disponível"
        className={`${classes} cursor-not-allowed opacity-90`}
      >
        {content}
      </button>
    )
  return (
    <a
      href={document.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${classes} hover:bg-slate-100`}
    >
      {content}
    </a>
  )
}

export function TimelineSection() {
  const { timeline } = aboutContent
  const [year, setYear] = useState<number>(timeline.initialYear)
  const selectedIndex = timeline.years.findIndex((entry) => entry.year === year)
  const count = timeline.years.length
  const selectedYear = timeline.years[selectedIndex]

  // As quatro colunas e o marcador usam os mesmos centros: 12,5%, 37,5%, 62,5% e 87,5%.
  const timelineStyle = {
    '--timeline-count': count,
    '--timeline-marker-position': `${((selectedIndex + 0.5) / count) * 100}%`,
    '--timeline-end-inset': `${50 / count}%`,
  } as CSSProperties

  function handleYearChange(event: ChangeEvent<HTMLInputElement>) {
    const nextIndex = Number(event.currentTarget.value)
    const nextYear = timeline.years[nextIndex]?.year
    if (nextYear !== undefined) setYear(nextYear)
  }

  return (
    <div className="about-timeline about-page-width mt-24 sm:mt-28">
      <div className="about-timeline__layout">
        <div className="min-w-0">
          <h3 className="text-home-documents max-w-md font-sans text-2xl leading-snug font-medium sm:text-3xl">
            {timeline.title}
          </h3>
          <div className="mt-14" aria-label="Cronograma do Programa de Metas">
            <div className="about-timeline__stage" style={timelineStyle}>
              <div className="about-timeline__years">
                {timeline.years.map((entry) => (
                  <button
                    key={entry.year}
                    type="button"
                    aria-pressed={year === entry.year}
                    onClick={() => setYear(entry.year)}
                    className={`about-timeline__year ${year === entry.year ? 'about-timeline__year--active' : ''}`}
                  >
                    {entry.year}
                  </button>
                ))}
              </div>
              <div className="about-timeline__track">
                <div className="about-timeline__marker" aria-hidden="true">
                  <img src={plusPing} alt="" draggable={false} />
                </div>
                <input
                  aria-label="Selecionar ano do cronograma"
                  aria-valuetext={`Ano ${year}`}
                  type="range"
                  min={0}
                  max={count - 1}
                  step={1}
                  value={selectedIndex}
                  onChange={handleYearChange}
                  className="about-timeline__range"
                />
              </div>
            </div>
            <p className="text-primary/70 mt-7 text-center text-xs">
              Clique no ano ou arraste o marcador para consultar os documentos.
            </p>
          </div>
        </div>
        <aside className="about-timeline__documents" aria-label={`Documentos do ano ${year}`}>
          <p className="font-display text-2xl leading-none text-white">{year}</p>
          <div className="about-timeline__documents-scroll mt-5" aria-live="polite">
            {selectedYear?.documents.length ? (
              selectedYear.documents.map((document) => (
                <div key={document.id} className="mb-7 last:mb-0">
                  <p className="text-sm leading-snug text-white">{document.title}</p>
                  <TimelineDocumentAction document={document} />
                </div>
              ))
            ) : (
              <p className="text-sm leading-relaxed text-white">
                Não há documentos cadastrados para {year}.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
