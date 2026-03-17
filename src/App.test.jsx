import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { render } from './testUtils/render'

jest.mock('./pages/ItemsPage', () => () => <div data-testid="items-page">Items Page</div>)
jest.mock('./pages/LocationsPage', () => () => <div data-testid="locations-page">Locations Page</div>)

describe('App routes', () => {
  test('renders ItemsPage at /', async () => {
    const view = await render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(view.container.querySelector('[data-testid="items-page"]')).toBeTruthy()
    expect(view.container.querySelector('[data-testid="locations-page"]')).toBeFalsy()

    await view.unmount()
  })

  test('renders LocationsPage at /locations', async () => {
    const view = await render(
      <MemoryRouter initialEntries={['/locations']}>
        <App />
      </MemoryRouter>,
    )

    expect(view.container.querySelector('[data-testid="items-page"]')).toBeFalsy()
    expect(view.container.querySelector('[data-testid="locations-page"]')).toBeTruthy()

    await view.unmount()
  })
})
