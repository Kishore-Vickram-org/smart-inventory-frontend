import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import AppShell from './AppShell'
import { render } from '../testUtils/render'

function getLinkByText(container, text) {
  const links = Array.from(container.querySelectorAll('a'))
  return links.find((a) => a.textContent?.trim() === text)
}

describe('AppShell', () => {
  test('renders header, branding and nav links', async () => {
    const view = await render(
      <MemoryRouter initialEntries={['/']}>
        <AppShell>
          <div>Child content</div>
        </AppShell>
      </MemoryRouter>,
    )

    expect(view.container.textContent).toContain('Harbor Inventory')
    expect(view.container.textContent).toContain('Simple CRUD')
    expect(view.container.textContent).toContain('Child content')

    const items = getLinkByText(view.container, 'Items')
    const locations = getLinkByText(view.container, 'Locations')
    expect(items).toBeTruthy()
    expect(locations).toBeTruthy()

    await view.unmount()
  })

  test('applies active class to current route', async () => {
    const view = await render(
      <MemoryRouter initialEntries={['/locations']}>
        <AppShell>
          <div />
        </AppShell>
      </MemoryRouter>,
    )

    const items = getLinkByText(view.container, 'Items')
    const locations = getLinkByText(view.container, 'Locations')

    expect(items.className).not.toContain('is-active')
    expect(locations.className).toContain('is-active')

    await view.unmount()
  })
})
