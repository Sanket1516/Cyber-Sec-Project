import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { PasswordProvider } from './context/PasswordContext'
import { SocketProvider } from './context/SocketContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LandingPage from './pages/LandingPage'
import PasswordInputPage from './pages/PasswordInputPage'
import AnalysisPage from './pages/AnalysisPage'
import AttackDashboardPage from './pages/AttackDashboardPage'
import AttackResultsPage from './pages/AttackResultsPage'
import CrackTimePage from './pages/CrackTimePage'
import VisualizationPage from './pages/VisualizationPage'
import RecommendationsPage from './pages/RecommendationsPage'

export default function App() {
  return (
    <SocketProvider>
      <PasswordProvider>
        <div className="min-h-screen flex flex-col bg-gray-950 text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/input" element={<PasswordInputPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/attack-dashboard" element={<AttackDashboardPage />} />
              <Route path="/attack-results" element={<AttackResultsPage />} />
              <Route path="/crack-time" element={<CrackTimePage />} />
              <Route path="/visualizations" element={<VisualizationPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="bottom-right" toastOptions={{
            style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' }
          }} />
        </div>
      </PasswordProvider>
    </SocketProvider>
  )
}
