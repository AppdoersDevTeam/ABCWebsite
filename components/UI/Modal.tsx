import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
      style={{ opacity: isOpen ? 1 : 0 }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[16px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative transition-all duration-300"
        style={{ 
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          opacity: isOpen ? 1 : 0
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-serif font-bold text-charcoal">{title}</h2>
            <button
              onClick={onClose}
              className="text-neutral hover:text-charcoal transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral hover:text-charcoal transition-colors p-2 hover:bg-gray-100 rounded-full z-10"
          >
            <X size={24} />
          </button>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

