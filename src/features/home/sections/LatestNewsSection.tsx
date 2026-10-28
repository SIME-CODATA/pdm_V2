import { ArrowRight } from 'lucide-react'
import { Container } from '@/shared/components/layout/Container'

import { homeContent } from '../data/home.content'

export function LatestNewsSection() {
  const { title, summary, date, dateLabel, imageUrl, articleUrl } = homeContent.news

  return (
    <section aria-labelledby="latest-news-title" className="pb-20 sm:pb-28">
      <Container>
        <div className="relative grid gap-5 lg:grid-cols-[1.1fr_1fr] lg:items-stretch lg:gap-7">
          <div className="relative min-h-64 overflow-hidden rounded-xl bg-linear-to-br from-[#596e91] via-[#9daecd] to-[#25365d] sm:min-h-90">
            {imageUrl && (
              <img
                src={imageUrl}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
          </div>

          <h2
            id="latest-news-title"
            className="bg-primary font-display absolute top-5 -left-4 z-10 rounded-sm px-6 py-3 text-3xl leading-none text-white sm:-left-8 sm:text-4xl"
          >
            Últimos destaques
          </h2>

          <article className="bg-search-surface text-primary flex min-w-0 flex-col rounded-xl p-6 sm:p-8">
            <h3 className="font-display text-[clamp(1.7rem,2.5vw,2.35rem)] leading-tight uppercase">
              {title}
            </h3>
            <p className="mt-6 font-sans text-base leading-snug sm:mt-9">{summary}</p>

            <div className="mt-auto flex items-center justify-between gap-4 pt-8">
              <time dateTime={date} className="font-sans text-base">
                {dateLabel}
              </time>
              {articleUrl ? (
                <a
                  href={articleUrl}
                  aria-label="Ler notícia completa"
                  className="bg-primary focus-visible:outline-primary inline-flex size-10 items-center justify-center rounded-full text-white hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <ArrowRight aria-hidden="true" size={23} />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-label="Notícia ainda sem link"
                  title="Link ainda não disponível"
                  className="bg-primary inline-flex size-10 cursor-not-allowed items-center justify-center rounded-full text-white opacity-85"
                >
                  <ArrowRight aria-hidden="true" size={23} />
                </button>
              )}
            </div>
          </article>
        </div>
      </Container>
    </section>
  )
}
