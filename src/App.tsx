import { AppProviders } from '@/app/providers/AppProviders'
import { Navbar } from '@/shared/components/layout/Navbar/Navbar'
import { Container } from '@/shared/components/layout/Container'

export default function App() {
  return (
    <AppProviders>
      <Navbar />

      <main>
        <Container className="py-12">
            
        </Container>
      </main>
    </AppProviders>
  )
}
