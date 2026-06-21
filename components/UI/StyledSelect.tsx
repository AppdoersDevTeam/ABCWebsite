import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface StyledSelectOption {
  value: string;
  label: string;
}

interface StyledSelectProps {
  id?: string;
  label: string;
  value: string;
  options: StyledSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  wrapLabels?: boolean;
}

export const StyledSelect: React.FC<StyledSelectProps> = ({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
  icon,
  wrapLabels = false,
}) => {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const selectedOption = options.find((option) => option.value === value);

  const updateMenuPosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleReposition = () => updateMenuPosition();

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  const menu = isOpen ? (
    <ul
      ref={menuRef}
      id={`${selectId}-listbox`}
      role="listbox"
      aria-label={label}
      style={menuStyle}
      className="max-h-72 overflow-y-auto rounded-[16px] border border-white/60 bg-white/95 p-2 shadow-xl backdrop-blur-md animate-fade-in-down"
    >
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <li key={option.value} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => handleSelect(option.value)}
              className={`flex w-full justify-between gap-3 px-4 py-2.5 text-left text-sm transition-all duration-200 ${
                wrapLabels ? 'items-start rounded-xl' : 'items-center rounded-full'
              } ${
                isSelected
                  ? 'bg-gold text-white shadow-md shadow-gold/25'
                  : 'text-charcoal hover:bg-gold/10 hover:text-charcoal'
              }`}
            >
              <span
                className={`font-semibold ${wrapLabels ? 'whitespace-normal leading-snug' : 'truncate'}`}
              >
                {option.label}
              </span>
              {isSelected && <Check size={16} className="flex-shrink-0" aria-hidden="true" />}
            </button>
          </li>
        );
      })}
    </ul>
  ) : null;

  return (
    <div ref={containerRef} className="relative w-full">
      <label htmlFor={selectId} className="sr-only">
        {label}
      </label>

      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${selectId}-listbox`}
        onClick={() => setIsOpen((open) => !open)}
        className={`group flex w-full items-center rounded-full border border-white/60 bg-white/80 py-3.5 pr-12 text-left shadow-sm transition-all duration-300 hover:border-gold/40 hover:bg-white/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold disabled:cursor-not-allowed disabled:opacity-60 ${
          icon ? 'pl-12' : 'pl-4'
        } ${isOpen ? 'border-gold ring-2 ring-gold/30' : ''}`}
      >
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 text-neutral transition-colors duration-300 group-hover:text-gold">
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-charcoal">
          {selectedOption?.label ?? label}
        </span>
      </button>

      <ChevronDown
        size={20}
        aria-hidden="true"
        className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral transition-transform duration-300 ${
          isOpen ? 'rotate-180 text-gold' : ''
        }`}
      />

      {menu && createPortal(menu, document.body)}
    </div>
  );
};
