import React from 'react';

type PageContainerProps = {
  as?: 'div' | 'section' | 'nav';
  className?: string;
  children: React.ReactNode;
};

/** Shared page gutter: 16px phone, 24px tablet (md), 32px desktop (lg). */
export const PAGE_CONTAINER_CLASS = 'page-container';

export const PageContainer: React.FC<PageContainerProps> = ({
  as: Tag = 'div',
  className = '',
  children,
}) => {
  return <Tag className={`${PAGE_CONTAINER_CLASS} ${className}`.trim()}>{children}</Tag>;
};
