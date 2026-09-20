import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { portalMenuPosition } from '../../lib/portalMenuPosition';

type PortalDropdownProps = {
  open: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  menuClassName?: string;
};

export const PortalDropdown: React.FC<PortalDropdownProps> = ({
  open,
  onClose,
  trigger,
  children,
  menuClassName = 'w-52',
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ position: 'fixed', zIndex: 9999 });

  const updatePosition = () => {
    const triggerEl = wrapRef.current;
    const menuEl = menuRef.current;
    if (!triggerEl) return;
    const t = triggerEl.getBoundingClientRect();
    const pos = portalMenuPosition(
      t,
      { width: menuEl?.offsetWidth || 208, height: menuEl?.offsetHeight || 160 },
      { width: window.innerWidth, height: window.innerHeight },
    );
    setStyle({ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!wrapRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        onClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, onClose]);

  return (
    <div className="inline-block" ref={wrapRef}>
      {trigger}
      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={style}
              className={`rounded-lg border border-gray-200 bg-white py-1 shadow-lg ${menuClassName}`}
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
