'use client';

import { Suspense } from 'react';
import Register from '@/components/pages/Register';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1115] flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div></div>}>
      <Register />
    </Suspense>
  );
}
