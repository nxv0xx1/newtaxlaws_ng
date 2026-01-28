"use client";

import { AdminTaxClarityForm } from '@/components/tax-app/admin-tax-clarity-form';

export default function AdminPage() {
  return (
    <main className="min-h-screen font-body bg-background text-foreground">
      <div className="container mx-auto max-w-2xl px-4 py-16 sm:py-24">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-black tracking-tight">
            Admin Tax Calculator
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Free report generation.
          </p>
        </header>

        <AdminTaxClarityForm />

      </div>
    </main>
  );
}
