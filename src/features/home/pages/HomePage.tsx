import { HeroSection } from '../sections/HeroSection'
import { GovernanceSection } from '../sections/GovernanceSection'
import { MayorMessageSection } from '../sections/MayorMessageSection'
import { GoalsSection } from '../sections/GoalsSection'
import { LatestNewsSection } from '../sections/LatestNewsSection'

export function HomePage() {
  return (
    <>
      <HeroSection />
      <GovernanceSection />
      <MayorMessageSection />
      <GoalsSection />
      <LatestNewsSection />
    </>
  )
}
