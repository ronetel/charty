import React, { Suspense } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      {children}
    </Suspense>
  );
};

export default Layout;