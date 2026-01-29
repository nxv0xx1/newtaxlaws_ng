"use client";

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function OldAdminPageContent() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <main className="min-h-screen font-body bg-background text-foreground flex items-center justify-center">
      <div className="container mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">This page has moved</h1>
        <p className="mt-2 text-muted-foreground">
          You will be redirected shortly.
        </p>
      </div>
    </main>
  );
}

export default function DeprecatedAdminPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OldAdminPageContent />
        </Suspense>
    );
}
