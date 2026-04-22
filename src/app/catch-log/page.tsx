import React from 'react';
import AppLayout from '@/components/AppLayout';
import CatchLogClient from './components/CatchLogClient';

export default function CatchLogPage() {
  return (
    <AppLayout currentPath="/catch-log">
      <CatchLogClient />
    </AppLayout>
  );
}