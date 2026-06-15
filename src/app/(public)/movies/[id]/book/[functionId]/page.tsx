'use client';

import { use } from 'react';
import MainLayout from '@/components/layout/MainLayout';

export default function BookPage({ params }: { params: Promise<{ id: string; functionId: string }> }) {
  const { id, functionId } = use(params);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl text-white font-bold">Pagina de Compra</h1>
        
      </div>
    </MainLayout>
  );
}
