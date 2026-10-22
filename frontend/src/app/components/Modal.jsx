import React, { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';

export function Modal({ title, children, onClose, wide = false }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  const titleId = useId();
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const onKey = (event) => {
      const dialogs = document.querySelectorAll('[role="dialog"]');
      if (dialogs[dialogs.length - 1] !== dialogRef.current) return;
      if (event.key === 'Escape') { event.stopPropagation(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const elements = dialogRef.current?.querySelectorAll('button:not(:disabled), input, textarea, select, a[href], [tabindex="0"]');
      if (!elements?.length) return;
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = overflow; window.removeEventListener('keydown', onKey); previous?.focus?.(); };
  }, []);
  return <div className="mm-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className={`mm-modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={dialogRef}><div className="mm-modal-header"><h2 id={titleId}>{title}</h2><button className="mm-icon-button" aria-label="Close dialog" onClick={onClose}><X size={19}/></button></div>{children}</div></div>;
}
export function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onClose }) {
  return <Modal title={title} onClose={onClose}><div className="mm-confirm-content"><p>{message}</p><div className="mm-modal-actions"><button className="mm-secondary-button" onClick={onClose}>Cancel</button><button className="mm-danger-button" onClick={onConfirm}>{confirmLabel}</button></div></div></Modal>;
}
