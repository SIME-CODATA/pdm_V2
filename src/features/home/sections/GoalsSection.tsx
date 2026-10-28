import { Container } from '@/shared/components/layout/Container'

import { GoalCard } from '../components/GoalCard'
import { MoreButton } from '../components/MoreButton'
import { homeContent } from '../data/home.content'

import './style/GoalsSection.css'

export function GoalsSection() {
  return (
    <section aria-labelledby="goals-section-title" className="pt-6 pb-20 sm:pb-28">
      <Container>
        <div className="goals-section__panel rounded-4xl bg-[#F4E9E0] pb-14">
          <h2
            id="goals-section-title"
            className="bg-primary font-display relative -top-5 mx-auto w-[90%] max-w-md rounded-sm px-5 py-3 text-center text-3xl leading-none text-white sm:text-4xl"
          >
            Nossas principais frentes
          </h2>

          <p className="text-primary mx-auto max-w-xl px-4 text-center font-sans text-base leading-snug">
            Para dar forma à complexidade do plano e orientar sua leitura, as metas estão divididas
            em 4 eixos temáticos.
          </p>

          {/* Cards ultrapassam as laterais do painel */}
          <div className="goals-section__cards mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {homeContent.goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-end lg:relative lg:bottom-10 lg:w-365">
          <MoreButton />
        </div>
      </Container>
    </section>
  )
}
