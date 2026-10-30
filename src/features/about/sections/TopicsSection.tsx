import { useState } from 'react'
import { GraduationCap, HeartPulse, House, Leaf, ShieldCheck, Users } from 'lucide-react'

import type { TopicIconKey } from '../data/about.content'
import { aboutContent } from '../data/about.content'
import { EdgeSectionTag } from '../components/EdgeSectionTag'
import { AssetVisual } from '../components/AssetVisual'

import './AboutShared.css'
import './TopicsSection.css'

const topicIcons = {shield: ShieldCheck, users: Users, house: House, graduation: GraduationCap, health: HeartPulse, leaf: Leaf,} satisfies Record<TopicIconKey, typeof ShieldCheck>

export function TopicsSection() {
  const { introduction, themes } = aboutContent
  const [selectedId, setSelectedId] = useState<string>(themes.initialTopic)

  return (
    <section aria-labelledby="about-title" className="about-topics relative pt-12 pb-20 sm:pt-16">
      <div className="about-page-width relative z-10">
        <h1 id="about-title" className="font-display text-5xl leading-none text-primary sm:text-6xl">{introduction.title}</h1>
        <p className="mt-5 max-w-md font-sans text-base leading-snug text-primary">{introduction.description}</p>
        <p className="mt-3 max-w-xl font-display text-xl uppercase leading-tight text-white sm:text-2xl">
          <span className="bg-primary px-1 py-0.5 box-decoration-clone">{introduction.emphasis}</span>
        </p>
      </div>

      <div className="about-topics__layout relative mt-14">
        <div className="about-topics__background" aria-hidden="true" />
        <EdgeSectionTag title={themes.label} />
        <p className="about-topics__subtitle relative z-10 mx-auto px-6 pt-7 text-center font-sans text-base leading-snug">
          {themes.subtitle}
        </p>
        <div className="about-topics__gallery" aria-label="Temas do Programa de Metas">
          {themes.items.map((topic) => {
            const active = selectedId === topic.id
            const Icon = topicIcons[topic.iconKey]
            return (
              <button key={topic.id} type="button" aria-pressed={active} aria-label={`Selecionar tema: ${topic.title}`} onClick={() => setSelectedId(topic.id)} className={`about-topic-card ${active ? 'about-topic-card--active' : ''}`} style={{ backgroundColor: topic.accentColor }}>
                <AssetVisual src={topic.imageUrl} alt="" className="about-topic-card__picture" fallback={<div className="h-full w-full bg-linear-to-br from-black/10 via-transparent to-black/40" />}/>
                <span className="about-topic-card__darken" aria-hidden="true" />
                <span className="about-topic-card__collapsed-icon" aria-hidden="true">
                  {topic.iconUrl ? <img src={topic.iconUrl} alt="" /> : <Icon size={21} strokeWidth={2.8} />}
                </span>
                <span className="about-topic-card__details" aria-hidden={!active}>
                  <span className="about-topic-card__large-icon" style={{ color: topic.accentColor }} aria-hidden="true">
                    {topic.iconUrl ? (
                        <span
                        className="about-topic-card__large-icon-mask"
                        style={{
                            maskImage: `url("${topic.iconUrl}")`,
                            WebkitMaskImage: `url("${topic.iconUrl}")`,
                        }}
                        />
                    ) : (
                        <Icon size={63} strokeWidth={2.2} />
                    )}
                    </span>
                  <span className="about-topic-card__description">
                    <strong className="font-display text-3xl leading-none sm:text-4xl lg:text-8xl">{topic.title}</strong>
                    <span className="mt-2 block leading-snug">{topic.description}</span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
