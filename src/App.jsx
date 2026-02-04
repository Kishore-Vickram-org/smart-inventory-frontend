import { Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import ItemsPage from './pages/ItemsPage'
import LocationsPage from './pages/LocationsPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<ItemsPage />} />
        <Route path="/locations" element={<LocationsPage />} />
      </Routes>
    </AppShell>
  )
}
