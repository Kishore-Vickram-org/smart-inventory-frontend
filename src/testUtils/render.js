import React, { act } from 'react'
import { createRoot } from 'react-dom/client'

export async function render(element) {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const root = createRoot(container)

  await act(async () => {
    root.render(element)
  })

  return {
    container,
    root,
    async unmount() {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
    rerender: async (nextElement) => {
      await act(async () => {
        root.render(nextElement)
      })
    },
  }
}

export async function flush() {
  await act(async () => {
    await Promise.resolve()
  })
}
