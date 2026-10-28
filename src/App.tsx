import { AppProviders } from '@/app/providers/AppProviders'
import { HomePage } from '@/features/home/pages/HomePage'
import { Footer } from '@/shared/components/layout/Footer/Footer'
import { Navbar } from '@/shared/components/layout/Navbar/Navbar'

export default function App() {
  return (
    <AppProviders>
      <Navbar />
      <main>
        <HomePage />
      </main>
      <Footer />
    </AppProviders>
  )
}
