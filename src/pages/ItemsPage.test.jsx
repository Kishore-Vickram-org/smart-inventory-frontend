import React from 'react'
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
  const proto =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : element instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype
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

function getButtonByText(container, text) {
  return Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.trim() === text)
}

function getModalPanel(container) {
  return container.querySelector('.modal__panel')
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

  test('loads items and filters by search', async () => {
    api.listItems.mockResolvedValueOnce([
      { id: 1, sku: 'SKU-1', name: 'Widget', description: 'One' },
      { id: 2, sku: 'SKU-2', name: 'Gadget', description: 'Two' },
    ])

    const view = await render(<ItemsPage />)
    await flush()

    expect(api.listItems).toHaveBeenCalledTimes(1)
    expect(view.container.textContent).toContain('Item List')
    expect(view.container.textContent).toContain('SKU-1')
    expect(view.container.textContent).toContain('SKU-2')

    const search = view.container.querySelector('input[placeholder="Search..."]')
    await setInputValue(search, 'widget')
    await flush()

    expect(view.container.textContent).toContain('SKU-1')
    expect(view.container.textContent).not.toContain('SKU-2')

    await view.unmount()
  })

  test('create validates, then creates, refreshes, and shows toast', async () => {
    api.listItems.mockResolvedValueOnce([])
    api.createItem.mockResolvedValueOnce({ id: 10 })
    api.listItems.mockResolvedValueOnce([{ id: 10, sku: 'SKU-NEW', name: 'New', description: '' }])

    const view = await render(<ItemsPage />)
    await flush()

    const createBtn = getButtonByText(view.container, 'Create')
    await click(createBtn)
    await flush()

    expect(view.container.textContent).toContain('SKU and Name are required')

    const skuInput = view.container.querySelector('input[placeholder="SKU"]')
    const nameInput = view.container.querySelector('input[placeholder="Name"]')
    const descInput = view.container.querySelector('textarea[placeholder="Description"]')

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

  test('edit flow calls updateItem and refreshes', async () => {
    api.listItems.mockResolvedValueOnce([{ id: 1, sku: 'SKU-1', name: 'Old', description: 'D' }])
    api.updateItem.mockResolvedValueOnce({})
    api.listItems.mockResolvedValueOnce([{ id: 1, sku: 'SKU-1', name: 'NewName', description: 'D' }])

    const view = await render(<ItemsPage />)
    await flush()

    const editBtn = getButtonByText(view.container, 'Edit')
    await click(editBtn)
    await flush()

    const panel = getModalPanel(view.container)
    expect(panel).toBeTruthy()

    const nameInput = panel.querySelector('input:not([disabled])')
    await setInputValue(nameInput, ' NewName ')

    const saveBtn = getButtonByText(panel, 'Save')
    await click(saveBtn)
    await flush()

    expect(api.updateItem).toHaveBeenCalledWith(1, { name: 'NewName', description: 'D' })

    await flush()

    expect(view.container.textContent).toContain('Item updated')
    await view.unmount()
  })

  test('delete flow calls deleteItem and refreshes', async () => {
    api.listItems.mockResolvedValueOnce([{ id: 1, sku: 'SKU-1', name: 'A', description: '' }])
    api.deleteItem.mockResolvedValueOnce({})
    api.listItems.mockResolvedValueOnce([])

    const view = await render(<ItemsPage />)
    await flush()

    const deleteBtn = getButtonByText(view.container, 'Delete')
    await click(deleteBtn)
    await flush()

    const panel = getModalPanel(view.container)
    expect(panel).toBeTruthy()
    const confirm = getButtonByText(panel, 'Delete')
    await click(confirm)
    await flush()

    expect(api.deleteItem).toHaveBeenCalledWith(1)
    expect(view.container.textContent).toContain('Item deleted')

    await view.unmount()
  })
})
