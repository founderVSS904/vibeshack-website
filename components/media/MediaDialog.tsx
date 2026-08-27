'use client'

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import styles from './MediaDialog.module.css'

interface MediaDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
  onKeyDown?: (event: KeyboardEvent<HTMLDialogElement>) => void
}

export default function MediaDialog({ open, onClose, title, description, children, className = '', onKeyDown }: MediaDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!open || !dialog) return

    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    const previousPadding = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      const padding = parseFloat(window.getComputedStyle(document.body).paddingRight) || 0
      document.body.style.paddingRight = `${padding + scrollbarWidth}px`
    }

    // The native top layer makes the background inert and contains keyboard focus.
    if (!dialog.open) dialog.showModal()
    closeRef.current?.focus({ preventScroll: true })

    return () => {
      if (dialog.open) dialog.close()
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPadding
      if (trigger?.isConnected) trigger.focus({ preventScroll: true })
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={`${styles.dialog} ${className}`}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClose={() => {
        if (open) onClose()
      }}
      onKeyDown={onKeyDown}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const rect = event.currentTarget.getBoundingClientRect()
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose()
      }}
    >
      {open && (
        <>
          <div className={styles.header}>
            <div className="min-w-0">
              <h2 id={titleId} className={styles.title}>{title}</h2>
              {description && <p id={descriptionId} className={styles.description}>{description}</p>}
            </div>
            <button ref={closeRef} type="button" onClick={onClose} className={styles.close} aria-label="Close viewer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>
              <span>Close</span>
            </button>
          </div>
          {children}
        </>
      )}
    </dialog>
  )
}
