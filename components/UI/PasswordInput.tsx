import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  wrapperClassName?: string;
};

export const PasswordInput = ({ className = '', wrapperClassName = '', ...props }: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`relative ${wrapperClassName}`.trim()}>
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`pr-12 ${className}`.trim()}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-neutral hover:text-charcoal p-1 rounded-full"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        tabIndex={0}
      >
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </div>
  );
};
