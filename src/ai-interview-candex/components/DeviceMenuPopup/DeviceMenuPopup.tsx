import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import DeviceMenu from '../DeviceMenu/DeviceMenu';
import styles from './deviceMenuPopup.module.scss';

interface DeviceMenuPopupProps {
  type: 'audio' | 'video';
  children: ReactNode;
}

export default function DeviceMenuPopup({ type, children }: DeviceMenuPopupProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const computeAndOpen = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuStyle({
      position: 'fixed',
      // Bottom of menu aligned 4px above top of trigger
      bottom: window.innerHeight - rect.top + 4,
      // Right edge of menu aligned with right edge of trigger
      right: window.innerWidth - rect.right,
      zIndex: 9999,
    });
    setOpen(true);
  }, []);

  const toggle = useCallback(() => {
    if (open) {
      setOpen(false);
    } else {
      computeAndOpen();
    }
  }, [open, computeAndOpen]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || wrapperRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <div
        ref={wrapperRef}
        className={styles.deviceMenuTrigger}
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {children}
      </div>
      {open && createPortal(
        <div ref={menuRef} style={menuStyle}>
          <DeviceMenu type={type} />
        </div>,
        document.body
      )}
    </>
  );
}
