import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { mdiCheck } from '@mdi/js';

export type TextSize = 'small' | 'medium' | 'large';

const OPTIONS: { value: TextSize; label: string }[] = [
  { value: 'small',  label: 'Small'  },
  { value: 'medium', label: 'Medium' },
  { value: 'large',  label: 'Large'  },
];

interface TextSizePopupProps {
  value: TextSize;
  onChange: (size: TextSize) => void;
  children: ReactNode;
}

export default function TextSizePopup({ value, onChange, children }: TextSizePopupProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef    = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const computeAndOpen = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuStyle({
      position: 'fixed',
      // Open below trigger with 8px gap
      top:   rect.bottom + 8,
      // Right-align menu with right edge of trigger
      right: window.innerWidth - rect.right,
      zIndex: 9999,
    });
    setOpen(true);
  }, []);

  const toggle = useCallback(() => {
    if (open) setOpen(false);
    else computeAndOpen();
  }, [open, computeAndOpen]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || wrapperRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleSelect = (size: TextSize) => {
    onChange(size);
    setOpen(false);
  };

  return (
    <>
      <div
        ref={wrapperRef}
        className="device-menu-trigger"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {children}
      </div>

      {open && createPortal(
        <div ref={menuRef} style={menuStyle}>
          <div className="device-menu ts-size-menu" role="listbox" aria-label="Text size">
            <div className="device-menu-section">
              <div className="device-menu-items ts-size-items">
                {OPTIONS.map((opt) => {
                  const selected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      role="option"
                      aria-selected={selected}
                      className={`device-menu-item ts-size-item${selected ? ' device-menu-item--selected' : ''}`}
                      onClick={() => handleSelect(opt.value)}
                    >
                      <span>{opt.label}</span>
                      {selected && (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="ts-size-check">
                          <path d={mdiCheck} />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
