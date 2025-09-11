import React, { useEffect } from 'react';

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel card-soft">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="btn-ghost" onClick={() => onClose && onClose()}>✕</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
