"use client";

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function DownloadPageContent() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the home page as the download feature is deprecated
    router.replace('/');
  }, [router]);

  return (
    <main className="min-h-screen font-body bg-background text-foreground flex items-center justify-center">
      <div className="container mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Redirecting...</h1>
        <p className="mt-2 text-muted-foreground">
          This page is no longer in use. You will be redirected shortly.
        </p>
      </div>
    </main>
  );
}

export default function DeprecatedDownloadPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DownloadPageContent />
        </Suspense>
    );
}
