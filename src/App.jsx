import { Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import ItemsPage from './pages/ItemsPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<ItemsPage />} />
      </Routes>
    </AppShell>
  )
}
