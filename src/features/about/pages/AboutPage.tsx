import { TopicsSection } from '../sections/TopicsSection'
import { AxesSection } from '../sections/AxesSection'
import { ConstructionSection } from '../sections/ConstructionSection'
import { MonitoringSection } from '../sections/MonitoringSection'
import { ParticipationSection } from '../sections/ParticipationSection'
import { HistorySection } from '../sections/HistorySection'

export function AboutPage() {
  return (
    <div className="min-w-0">
      <TopicsSection />
      <AxesSection />
      <ConstructionSection />
      <MonitoringSection />
      <ParticipationSection />
      <HistorySection />
    </div>
  )
}
