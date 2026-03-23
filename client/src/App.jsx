import { Routes, Route, Navigate } from 'react-router-dom'
import TopBar from './components/layout/TopBar'
import PlayPage from './components/play/PlayPage'
import ScoreboardPage from './components/scores/ScoreboardPage'
import AdminPage from './components/admin/AdminPage'
import HelpPage from './components/help/HelpPage'
import PenaltyPage from './components/penalties/PenaltyPage'

export default function App() {
  return (
    <div>
      <TopBar />
      <Routes>
        <Route path="/" element={<Navigate to="/scores" replace />} />
        <Route path="/play/:slug" element={<PlayPage />} />
        <Route path="/scores" element={<ScoreboardPage />} />
        <Route path="/penalties" element={<PenaltyPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  )
}
