import React from 'react';
import AppLayout from '@/components/AppLayout';
import CollectionBookClient from './components/CollectionBookClient';

export default function CardCollectionPage() {
  return (
    <AppLayout currentPath="/card-collection">
      <div className="fade-in">
        <CollectionBookClient />
      </div>
    </AppLayout>
  );
}
