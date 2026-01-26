import { Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import ItemsPage from './pages/ItemsPage'
import MovementsPage from './pages/MovementsPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<ItemsPage />} />
        <Route path="/movements" element={<MovementsPage />} />
      </Routes>
    </AppShell>
  )
}
