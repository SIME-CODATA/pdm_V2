import type { HomeGoalContent, HomeGoalIcon } from '../data/home.content'

const cardStyles: Record<HomeGoalIcon, { badge: string; tint: string; fallback: string }> = {
  environment: {
    badge: 'bg-axis-environment',
    tint: 'bg-axis-environment/20',
    fallback: 'bg-gradient-to-br from-emerald-800 via-emerald-600 to-green-950',
  },

  education: {
    badge: 'bg-axis-education',
    tint: 'bg-axis-education/20',
    fallback: 'bg-gradient-to-br from-indigo-800 via-blue-600 to-slate-900',
  },

  health: {
    badge: 'bg-axis-health',
    tint: 'bg-axis-health/20',
    fallback: 'bg-gradient-to-br from-orange-700 via-amber-600 to-orange-950',
  },

  security: {
    badge: 'bg-axis-security',
    tint: 'bg-axis-security/20',
    fallback: 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950',
  },
}

interface GoalCardProps {
  goal: HomeGoalContent
}

export function GoalCard({ goal }: GoalCardProps) {
  const styles = cardStyles[goal.id]

  return (
    <article className="relative mx-auto w-full max-w-75 min-w-0 pt-11">
      {/* Fotografia do eixo */}
      <div className={`relative aspect-2/3 overflow-hidden rounded-xl ${styles.fallback}`}>
        {goal.imageUrl && (
          <img
            src={goal.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        )}

        {/* Escurecimento geral da fotografia */}
        <div className="absolute inset-0" aria-hidden="true" />
        {/* Painel translúcido */}
        <div className="absolute inset-x-[16%] top-[13%] bottom-[14%] overflow-hidden rounded-xl border border-white/20 backdrop-blur-[3px] transition-transform duration-500 ease-out hover:scale-110">
          {/* Base escura */}
          <div className="absolute inset-0" aria-hidden="true" />
          {/* Tonalidade específica do eixo */}
          <div className={`absolute inset-0 ${styles.tint}`} aria-hidden="true" />
          {/* Conteúdo */}
          <div className="relative z-10 flex h-full flex-col items-center px-3 py-6 text-center text-white">
            <div className="flex flex-1 flex-col items-center justify-center">
              <span className="font-display text-[clamp(4.25rem,5vw,5.5rem)] leading-none">
                {goal.count}
              </span>
              <span className="font-display text-3xl leading-none">METAS</span>
            </div>
            <p className="flex min-h-14 items-center justify-center font-sans text-sm leading-snug sm:text-base">
              {goal.label}
            </p>
          </div>
        </div>
      </div>

      {/* Ícone do eixo */}
      <div
        className={`absolute top-0 left-1/2 z-10 flex size-22 -translate-x-1/2 items-center justify-center rounded-full ${styles.badge}`}
      >
        {goal.iconUrl && (
          <img
            src={goal.iconUrl}
            alt=""
            aria-hidden="true"
            className="size-12 object-contain brightness-0 invert"
          />
        )}
      </div>
    </article>
  )
}
