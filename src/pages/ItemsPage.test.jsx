import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { act } from 'react'
import ItemsPage from './ItemsPage'
import { flush, render } from '../testUtils/render'

jest.mock('../api/inventoryApi', () => {
  return {
    listItems: jest.fn(),
    createItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
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

async function blur(el) {
  await act(async () => {
    el.dispatchEvent(new Event('blur', { bubbles: true }))
  })
}

function getModalPanel(container) {
  return container.querySelector('.modal__panel')
}

function getButtonByText(container, text) {
  return Array.from(container.querySelectorAll('button')).find((b) => b.textContent === text)
}

describe('ItemsPage', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    api.listItems.mockReset()
    api.createItem.mockReset()
    api.updateItem.mockReset()
    api.deleteItem.mockReset()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
  })

  test('loads and renders items, filters, clears form', async () => {
    api.listItems.mockResolvedValueOnce([
      { id: 1, sku: 'SKU-1', name: 'Widget', description: 'One' },
      { id: 2, sku: 'SKU-2', name: 'Gadget', description: null },
    ])

    const view = await render(
      <MemoryRouter>
        <ItemsPage />
      </MemoryRouter>,
    )

    await flush()

    expect(api.listItems).toHaveBeenCalledTimes(1)
    expect(view.container.textContent).toContain('Item List')
    expect(view.container.textContent).toContain('SKU-1')
    expect(view.container.textContent).toContain('SKU-2')

    const search = view.container.querySelector('input[placeholder="Search…"]')
    await setInputValue(search, 'widget')
    await flush()

    expect(view.container.textContent).toContain('1 item(s)')
    expect(view.container.textContent).toContain('SKU-1')
    expect(view.container.textContent).not.toContain('SKU-2')

    const skuInput = view.container.querySelector('input[placeholder="e.g. STEEL-001"]')
    const nameInput = view.container.querySelector('input[placeholder="Item name"]')
    const descInput = view.container.querySelector('textarea[placeholder="Short description…"]')

    await setInputValue(skuInput, '  STEEL-001  ')
    await blur(skuInput)
    await setInputValue(nameInput, 'My Item')
    await setInputValue(descInput, 'Hello')

    const clearBtn = getButtonByText(view.container, 'Clear')
    await click(clearBtn)

    expect(skuInput.value).toBe('')
    expect(nameInput.value).toBe('')
    expect(descInput.value).toBe('')

    await view.unmount()
  })

  test('create validates required fields, then creates and refreshes with toast', async () => {
    api.listItems.mockResolvedValueOnce([])
    api.createItem.mockResolvedValueOnce({ id: 10 })
    api.listItems.mockResolvedValueOnce([{ id: 10, sku: 'SKU-NEW', name: 'New', description: '' }])

    const view = await render(
      <MemoryRouter>
        <ItemsPage />
      </MemoryRouter>,
    )

    await flush()

    const createBtn = getButtonByText(view.container, 'Create')
    await click(createBtn)
    expect(view.container.textContent).toContain('SKU and Name are required')

    const skuInput = view.container.querySelector('input[placeholder="e.g. STEEL-001"]')
    const nameInput = view.container.querySelector('input[placeholder="Item name"]')
    const descInput = view.container.querySelector('textarea[placeholder="Short description…"]')

    await setInputValue(skuInput, 'SKU-NEW')
    await setInputValue(nameInput, 'New')
    await setInputValue(descInput, '  ')

    await click(createBtn)
    await flush()

    expect(api.createItem).toHaveBeenCalledWith({ sku: 'SKU-NEW', name: 'New', description: undefined })

    await flush()

    expect(api.listItems).toHaveBeenCalledTimes(2)
    expect(view.container.textContent).toContain('Item created')

    await act(async () => {
      jest.advanceTimersByTime(2300)
    })

    expect(view.container.textContent).not.toContain('Item created')

    await view.unmount()
  })

  test('edit flow calls update and shows updated toast', async () => {
    api.listItems.mockResolvedValueOnce([{ id: 1, sku: 'SKU-1', name: 'Old', description: 'D' }])
    api.updateItem.mockResolvedValueOnce({})
    api.listItems.mockResolvedValueOnce([{ id: 1, sku: 'SKU-1', name: 'NewName', description: 'D' }])

    const view = await render(
      <MemoryRouter>
        <ItemsPage />
      </MemoryRouter>,
    )

    await flush()

    const editBtn = getButtonByText(view.container, 'Edit')
    await click(editBtn)
    await flush()

    expect(view.container.textContent).toContain('Edit Item')

    const panel = getModalPanel(view.container)
    expect(panel).toBeTruthy()
    const nameInput = Array.from(panel.querySelectorAll('input')).find((i) => i.disabled === false)
    await setInputValue(nameInput, ' NewName ')

    // Click submit button inside modal panel
    const saveBtn = Array.from(panel.querySelectorAll('button')).find((b) => b.textContent === 'Save')
    await click(saveBtn)
    await flush()

    expect(api.updateItem).toHaveBeenCalledWith(1, { name: 'NewName', description: 'D' })

    await flush()

    expect(view.container.textContent).toContain('Item updated')

    await view.unmount()
  })

  test('delete flow calls deleteItem and handles API errors', async () => {
    api.listItems.mockResolvedValueOnce([{ id: 1, sku: 'SKU-1', name: 'A', description: '' }])
    api.deleteItem.mockRejectedValueOnce(new Error('Nope'))

    const view = await render(
      <MemoryRouter>
        <ItemsPage />
      </MemoryRouter>,
    )

    await flush()

    const deleteBtn = getButtonByText(view.container, 'Delete')
    await click(deleteBtn)

    const panel = getModalPanel(view.container)
    expect(panel).toBeTruthy()

    const confirmDelete = Array.from(panel.querySelectorAll('button')).find((b) => b.textContent === 'Delete')
    await click(confirmDelete)

    expect(api.deleteItem).toHaveBeenCalledWith(1)
    await flush()

    expect(view.container.textContent).toContain('Nope')

    await view.unmount()
  })

  test('handles listItems failure', async () => {
    api.listItems.mockRejectedValueOnce(new Error('Failed list'))

    const view = await render(
      <MemoryRouter>
        <ItemsPage />
      </MemoryRouter>,
    )

    await flush()

    expect(view.container.textContent).toContain('Failed list')
    await view.unmount()
  })
})
