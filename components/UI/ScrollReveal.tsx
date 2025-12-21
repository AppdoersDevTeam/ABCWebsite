import { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
  className?: string;
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
  children, 
  delay = 0, 
  direction = 'up',
  className = '',
  threshold = 0.1
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
            // Optionally unobserve after animation
            // observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px', // Trigger slightly before element is fully visible
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay, threshold]);

  const getTransformClass = () => {
    if (isVisible) return 'opacity-100 translate-x-0 translate-y-0 scale-100';
    
    switch (direction) {
      case 'up':
        return 'opacity-0 translate-y-8';
      case 'down':
        return 'opacity-0 -translate-y-8';
      case 'left':
        return 'opacity-0 translate-x-8';
      case 'right':
        return 'opacity-0 -translate-x-8';
      case 'scale':
        return 'opacity-0 scale-95';
      case 'fade':
      default:
        return 'opacity-0';
    }
  };

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-700 ease-out ${getTransformClass()} ${className}`}
    >
      {children}
    </div>
  );
};

