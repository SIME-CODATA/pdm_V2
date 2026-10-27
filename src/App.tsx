import { AppProviders } from '@/app/providers/AppProviders'
import { HomePage } from '@/features/home/pages/HomePage'
import { Navbar } from '@/shared/components/layout/Navbar/Navbar'

export default function App() {
  return (
    <AppProviders>
      <Navbar />

      <main>
        <HomePage />
      </main>
    </AppProviders>
  )
}
