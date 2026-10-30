import { BrowserRouter, Route, Routes } from 'react-router'

import { AppProviders } from '@/app/providers/AppProviders'
import { HomePage } from '@/features/home/pages/HomePage'
import { AboutPage } from '@/features/about/pages/AboutPage'
import { Navbar } from '@/shared/components/layout/Navbar/Navbar'
import { Footer } from '@/shared/components/layout/Footer/Footer'

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Navbar />
        <main id="main-content" className="min-w-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sobre-o-pdm" element={<AboutPage />} />
            <Route path="*" element={<div className="mx-auto max-w-4xl px-6 py-24 text-center"><h1 className="font-display text-5xl">Página não encontrada</h1></div>} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AppProviders>
  )
}
