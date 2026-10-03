import { useEffect, useId, useRef, type ReactNode } from 'react';

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    const field = dialog?.querySelector<HTMLElement>('input, textarea');
    field?.focus();
    return () => { dialog?.close(); trigger?.focus(); };
  }, []);
  return <dialog ref={ref} className="app-dialog" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <div className="dialog-heading"><h2 id={titleId}>{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog">Close</button></div>
    {children}
  </dialog>;
}
