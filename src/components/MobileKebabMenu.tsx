import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon, IconName, IconSize } from '@eightfold.ai/octuple';
import { mdiInformationOutline, mdiClosedCaption, mdiViewGrid } from '@mdi/js';
import { useInterview } from '@context/InterviewContext';

interface MobileKebabMenuProps {
  children: ReactNode;
}

const MENU_ITEMS = [
  { icon: mdiInformationOutline, label: 'Troubleshoot', action: 'troubleshoot' },
  { icon: mdiClosedCaption, label: 'Interviewer transcript', action: 'transcript' },
  { icon: mdiViewGrid, label: 'View', action: 'view' },
] as const;

const MENU_WIDTH = 224;

export default function MobileKebabMenu({ children }: MobileKebabMenuProps) {
  const { dispatch } = useInterview();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const openMenu = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = Math.max(8, rect.left + rect.width / 2 - MENU_WIDTH / 2);
    setMenuStyle({
      position: 'fixed',
      bottom: window.innerHeight - rect.top + 8,
      left: Math.min(left, window.innerWidth - MENU_WIDTH - 8),
      zIndex: 9999,
    });
    setOpen(true);
  }, []);

  const toggle = () => (open ? setOpen(false) : openMenu());

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        wrapperRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleItem = (action: string) => {
    setOpen(false);
    if (action === 'transcript') {
      dispatch({ type: 'TOGGLE_TRANSCRIPT_PANEL' });
    }
  };

  return (
    <>
      <div ref={wrapperRef} style={{ display: 'inline-flex' }} onClick={toggle}>
        {children}
      </div>

      {open &&
        createPortal(
          <div ref={menuRef} className="mob-kebab-menu" style={menuStyle}>
            {MENU_ITEMS.map(item => (
              <button
                key={item.action}
                className="mob-kebab-item"
                onClick={() => handleItem(item.action)}
              >
                <Icon path={item.icon as IconName} size={IconSize.Small} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
