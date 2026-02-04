import { NavLink } from 'react-router-dom'

export default function AppShell({ children }) {
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <div className="brand__title">Harbor Inventory</div>
            <div className="brand__subtitle">Simple CRUD • React + Spring Boot</div>
          </div>

          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}>
              Items
            </NavLink>
            <NavLink
              to="/locations"
              className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
            >
              Locations
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="container">{children}</main>
    </div>
  )
}
