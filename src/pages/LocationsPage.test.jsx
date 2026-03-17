import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { act } from 'react'
import LocationsPage from './LocationsPage'
import { flush, render } from '../testUtils/render'

jest.mock('../api/inventoryApi', () => {
  return {
    listLocations: jest.fn(),
    createLocation: jest.fn(),
    updateLocation: jest.fn(),
    deleteLocation: jest.fn(),
  }
})

const api = require('../api/inventoryApi')

function setNativeValue(element, value) {
  const proto = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'value')
  if (descriptor?.set) {
    descriptor.set.call(element, value)
  } else {
    element.value = value
  }
}

async function setInputValue(input, value) {
  await act(async () => {
    setNativeValue(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

async function click(el) {
  await act(async () => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

function getModalPanel(container) {
  return container.querySelector('.modal__panel')
}

function getButtonByText(container, text) {
  return Array.from(container.querySelectorAll('button')).find((b) => b.textContent === text)
}

describe('LocationsPage', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    api.listLocations.mockReset()
    api.createLocation.mockReset()
    api.updateLocation.mockReset()
    api.deleteLocation.mockReset()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
  })

  test('loads and filters locations', async () => {
    api.listLocations.mockResolvedValueOnce([
      { id: 1, code: 'WH-1', name: 'Warehouse', type: 'WAREHOUSE' },
      { id: 2, code: 'DOCK-1', name: 'Dock', type: 'DOCK' },
    ])

    const view = await render(
      <MemoryRouter>
        <LocationsPage />
      </MemoryRouter>,
    )

    await flush()

    expect(api.listLocations).toHaveBeenCalledTimes(1)
    expect(view.container.textContent).toContain('WH-1')
    expect(view.container.textContent).toContain('DOCK-1')

    const search = view.container.querySelector('input[placeholder="Search…"]')
    await setInputValue(search, 'dock')
    await flush()

    expect(view.container.textContent).toContain('1 location(s)')
    expect(view.container.textContent).toContain('DOCK-1')
    expect(view.container.textContent).not.toContain('WH-1')

    await view.unmount()
  })

  test('create modal validates required, then creates and shows toast', async () => {
    api.listLocations.mockResolvedValueOnce([])
    api.createLocation.mockResolvedValueOnce({ id: 10 })
    api.listLocations.mockResolvedValueOnce([{ id: 10, code: 'A-1', name: 'Aisle', type: 'AISLE' }])

    const view = await render(
      <MemoryRouter>
        <LocationsPage />
      </MemoryRouter>,
    )

    await flush()

    const addBtn = getButtonByText(view.container, 'Add Location')
    await click(addBtn)

    expect(view.container.textContent).toContain('Add Location')

    const panel = getModalPanel(view.container)
    expect(panel).toBeTruthy()

    const createBtn = Array.from(panel.querySelectorAll('button')).find((b) => b.textContent === 'Create')
    await click(createBtn)

    expect(view.container.textContent).toContain('Code and Name are required')

    const codeInput = panel.querySelector('input[placeholder="e.g. WH-1"]')
    const nameInput = panel.querySelector('input[placeholder="Warehouse 1"]')
    const typeSelect = panel.querySelector('select')

    await setInputValue(codeInput, 'A-1')
    await setInputValue(nameInput, 'Aisle')
    await setInputValue(typeSelect, 'AISLE')

    await click(createBtn)
    await flush()

    expect(api.createLocation).toHaveBeenCalledWith({ code: 'A-1', name: 'Aisle', type: 'AISLE' })

    await flush()

    expect(view.container.textContent).toContain('Location created')

    await act(async () => {
      jest.advanceTimersByTime(2300)
    })
    expect(view.container.textContent).not.toContain('Location created')

    await view.unmount()
  })

  test('edit flow requires name, calls update, and supports delete conflict error', async () => {
    api.listLocations.mockResolvedValueOnce([{ id: 1, code: 'WH-1', name: 'Old', type: 'WAREHOUSE' }])
    api.updateLocation.mockResolvedValueOnce({})
    api.listLocations.mockResolvedValueOnce([{ id: 1, code: 'WH-1', name: 'New', type: 'ZONE' }])
    api.deleteLocation.mockRejectedValueOnce(new Error('Conflict'))

    const view = await render(
      <MemoryRouter>
        <LocationsPage />
      </MemoryRouter>,
    )

    await flush()

    const editBtn = getButtonByText(view.container, 'Edit')
    await click(editBtn)
    await flush()

    const panel = getModalPanel(view.container)
    expect(panel).toBeTruthy()

    const saveBtn = Array.from(panel.querySelectorAll('button')).find((b) => b.textContent === 'Save')

    const nameInput = panel.querySelector('input[placeholder="Warehouse 1"]')
    await setInputValue(nameInput, '   ')
    await click(saveBtn)
    expect(view.container.textContent).toContain('Name is required')

    await setInputValue(nameInput, 'New')

    const typeSelect = panel.querySelector('select')
    await setInputValue(typeSelect, 'ZONE')

    await click(saveBtn)
    await flush()

    expect(api.updateLocation).toHaveBeenCalledWith(1, { name: 'New', type: 'ZONE' })

    await flush()

    expect(view.container.textContent).toContain('Location updated')

    const deleteBtn = getButtonByText(view.container, 'Delete')
    await click(deleteBtn)

    const deletePanel = getModalPanel(view.container)
    expect(deletePanel).toBeTruthy()

    const confirmDelete = Array.from(deletePanel.querySelectorAll('button')).find((b) => b.textContent === 'Delete')
    await click(confirmDelete)

    await flush()

    expect(view.container.textContent).toContain('Conflict')

    await view.unmount()
  })

  test('handles listLocations failure', async () => {
    api.listLocations.mockRejectedValueOnce(new Error('Failed locations'))

    const view = await render(
      <MemoryRouter>
        <LocationsPage />
      </MemoryRouter>,
    )

    await flush()

    expect(view.container.textContent).toContain('Failed locations')
    await view.unmount()
  })
})
