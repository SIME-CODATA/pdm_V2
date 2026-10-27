import { CircleDot, ClipboardCheck, Coins } from 'lucide-react'

import { homeContent } from '../data/home.content'
import { MoreButton } from '../components/MoreButton'

const highlightIcons = {
  transparency: ClipboardCheck,
  cooperation: CircleDot,
  resources: Coins,
} as const

export function GovernanceSection() {
  const { heading, description, backgroundImageUrl, highlights, moreUrl } =
    homeContent.governance

  return (
    <section
      aria-labelledby="governance-title"
      className="relative isolate bg-[#12353c] text-white"
    >
      {/* Foto e overlay ocupam a seção inteira, sem Container artificial. */}
      {backgroundImageUrl && (
        <img
          src={backgroundImageUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-[#001b21]/75" aria-hidden="true" />

      <div className="grid min-h-110 lg:grid-cols-[minmax(0,1fr)_minmax(350px,44%)] lg:items-center">
        <div className="px-gutter py-14 sm:px-8 lg:py-20 lg:pr-12 lg:pl-[clamp(2rem,9.5vw,11.25rem)]">
          <h2
            id="governance-title"
            className="max-w-lg font-display text-[clamp(2.25rem,3.4vw,3.5rem)] leading-[1.05]"
          >
            {heading}
          </h2>
          <p className="mt-9 max-w-lg font-sans text-lg leading-relaxed">{description}</p>
        </div>

        {/* Caixa ciano alinhada naturalmente à borda direita da viewport. */}
        <div className="flex min-h-77.5 flex-col justify-center gap-7 rounded-tl-3xl rounded-bl-3xl bg-home-documents px-gutter py-10 sm:px-12 lg:min-h-80 lg:py-14">
          {highlights.map(({ id, label }) => {
            const Icon = highlightIcons[id]
            return (
              <div key={id} className="flex items-center gap-5">
                <Icon className="size-9 shrink-0 text-white" strokeWidth={2.5} aria-hidden="true" />
                <span className="max-w-72 font-sans text-base leading-snug font-semibold uppercase sm:text-lg">
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="absolute right-[max(1.5rem,5vw)] bottom-0 z-10 translate-y-1/2">
        <MoreButton href={moreUrl} />
      </div>
    </section>
  )
}
