import { useEffect } from 'react'

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 2200)
    return () => clearTimeout(t)
  }, [message, onClose])

  if (!message) return null
  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
      <button className="toast__close" type="button" onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  )
}
