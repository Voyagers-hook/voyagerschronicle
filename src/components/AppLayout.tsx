import React from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export default function AppLayout({ children, currentPath }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-adventure-bg adventure-texture">
      <Sidebar currentPath={currentPath} />
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 bg-[#F8F5F0] rounded-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}