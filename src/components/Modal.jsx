export default function Modal({ open, title, children, onClose }) {
  if (!open) return null
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <button className="modal__backdrop" type="button" onClick={onClose} aria-label="Close" />
      <div className="modal__panel">
        <div className="modal__head">
          <div className="modal__title">{title}</div>
          <button className="btn btn--small btn--ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
