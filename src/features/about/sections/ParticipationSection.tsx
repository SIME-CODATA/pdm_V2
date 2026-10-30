import { Gavel, MessageSquareText, } from 'lucide-react'

import { aboutContent } from '../data/about.content'
import { AssetVisual } from '../components/AssetVisual'

import './ParticipationSection.css'

export function ParticipationSection() {
  const { participation } = aboutContent
  return (
    <section aria-labelledby="about-participation-title" className="about-participation pt-12 pb-20">
      <div className="about-participation__hero">
        <AssetVisual
          src={participation.imageUrl}
          alt="Participação da população na cidade de São Paulo"
          className="about-participation__picture"
          fallback={<div className="h-full w-full bg-linear-to-br from-[#075b78] to-home-documents" />}
        />
        <div className="about-participation__intro">
          <div className="max-w-lg">
            <h2 id="about-participation-title" className="font-display text-4xl leading-none text-primary sm:text-5xl">{participation.title}</h2>
            <p className="mt-5 text-base leading-relaxed">{participation.paragraph1}</p>
            <p className="mt-5 text-base leading-relaxed">{participation.paragraph2}</p>
          </div>
        </div>
      </div>

      <div className="about-participation__youtube about-page-width">
        <span className="about-participation__youtube-icon" aria-hidden="true"><i className="fa-brands fa-youtube text-red-600 text-4xl"></i></span>
        <div className='shadow-[0_2px_5px_rgb(0_0_0/0.2)] bg-white -ml-8 z-[-1] pl-12 p-4 rounded-e-4xl'>
            {participation.youtubeUrl ? (
            <a href={participation.youtubeUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{participation.youtubeNote}</a>
            ) : <span>{participation.youtubeNote}</span>}
        </div>
      </div>

      <div className="about-participation__details about-page-width mt-16">
        <div className="min-w-0">
          <h3 className="flex items-center gap-4 text-lg font-medium uppercase text-accent">{participation.audiencesTitle}<MessageSquareText size={24} aria-hidden="true" /></h3>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">{participation.audiencesText}</p>
        </div>
        <div className="min-w-0 border-t border-home-documents pt-8 sm:border-t-0 sm:border-l sm:pl-9 sm:pt-0">
          <h3 className="flex items-center gap-4 text-lg font-medium uppercase text-accent">{participation.responsesTitle}<Gavel size={24} aria-hidden="true" /></h3>
          <p className="mt-4 max-w-sm  leading-relaxed">{participation.responsesText}</p>
          {participation.responsesUrl && <a href={participation.responsesUrl} className="text-primary underline underline-offset-2">Página de Devolutivas</a>}
        </div>
      </div>

      <dl className="about-participation__stats about-page-width mt-14">
        {participation.stats.map((item) => (
          <div key={item.label} className="about-participation__stat">
            <dt className="text-center text-xs uppercase leading-snug">{item.label}</dt>
            <dd className="order-first mb-2 font-display text-5xl leading-none text-black sm:text-6xl">{item.number}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
