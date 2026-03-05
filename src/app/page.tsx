"use client";

import { useState, useEffect } from 'react';
import { TaxClarityForm } from '@/components/tax-app/tax-clarity-form';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ArrowRight, CheckCircle2, ShieldCheck, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="min-h-screen font-sans bg-background text-foreground selection:bg-emerald-100 selection:text-emerald-900">
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-20">

        {/* Navigation / Branding */}
        <nav className="flex items-center justify-between mb-16 sm:mb-24">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-serif font-bold text-xl">
              N
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-foreground">newtaxlaws_ng</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800">
              <ShieldCheck className="w-4 h-4" />
              Updated for 2026 Act
            </span>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="text-center mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream-100 border border-emerald-100 text-emerald-800 text-sm font-medium mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            New 2026 Tax Rules are Live
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-foreground tracking-tight mb-6 leading-[1.1]">
            How much will you <br className="hidden sm:block" />
            <span className="text-primary italic">keep</span> in 2026?
          </h1>

          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The new Nigeria Tax Act 2025 changes everything. See exactly how the new tax-free allowances and rates affect your pocket.
          </p>
        </header>

        {/* Main Content Area */}
        <div className="grid gap-12 lg:gap-24">

          {/* The Calculator (Center Stage) */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50 to-cream-100 rounded-3xl transform -rotate-1 scale-[1.02] -z-10 opacity-70"></div>
            <TaxClarityForm />
          </div>

          {/* Information Tabs */}
          <div className="max-w-3xl mx-auto w-full">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl font-bold mb-3">Key Changes at a Glance</h2>
              <p className="text-muted-foreground">Simplified breakdown of the officially approved act.</p>
            </div>

            {isMounted ? (
              <Tabs defaultValue="individuals" className="w-full">
                <TabsList className="w-full justify-center bg-transparent h-auto p-1 gap-2 mb-8 flex-wrap">
                  <TabsTrigger
                    value="individuals"
                    className="bg-cream-50 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md border border-transparent data-[state=active]:border-primary/20 px-6 py-2.5 rounded-full transition-all duration-300"
                  >
                    For Individuals
                  </TabsTrigger>
                  <TabsTrigger
                    value="small-business"
                    className="bg-cream-50 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md border border-transparent data-[state=active]:border-primary/20 px-6 py-2.5 rounded-full transition-all duration-300"
                  >
                    Small Business
                  </TabsTrigger>
                  <TabsTrigger
                    value="large-business"
                    className="bg-cream-50 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md border border-transparent data-[state=active]:border-primary/20 px-6 py-2.5 rounded-full transition-all duration-300"
                  >
                    Corporates
                  </TabsTrigger>
                </TabsList>

                <div className="bg-white/50 backdrop-blur-sm border border-emerald-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                  <TabsContent value="individuals" className="mt-0">
                    <ul className="space-y-4">
                      {[
                        "The first ₦800,000 you earn each year is completely tax-free.",
                        "New progressive rates: 15% on next ₦2.2m, up to 25% for top earners.",
                        "Low earners (minimum wage) effectively pay 0% tax.",
                        "Deduct 20% of your annual rent (up to ₦500k) from taxable income.",
                        "Personal and business loans are not treated as taxable income.",
                        "Compensation for job loss up to ₦50 million is tax-free."
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>

                  <TabsContent value="small-business" className="mt-0">
                    <ul className="space-y-4">
                      {[
                        "0% Company Income Tax if turnover is under ₦100m.",
                        "Most small businesses are exempt from the 4% development levy.",
                        "Presumptive tax option: pay a small flat likelihood percentage.",
                        "Simplified compliance requirements for SMEs."
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>

                  <TabsContent value="large-business" className="mt-0">
                    <ul className="space-y-4">
                      {[
                        "30% Corporate Tax on profits for turnover >₦100m.",
                        "New 4% Development Levy replaces Education Tax & IT Levy.",
                        "Minimum effective tax rate of 15% for multinationals.",
                        "Capital Gains Tax increased to 30% (from 10%)."
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                </div>
              </Tabs>
            ) : (
              <div className="w-full space-y-4">
                <Skeleton className="h-12 w-full rounded-full" />
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
            )}
          </div>

          {/* Download CTA */}
          <div className="bg-primary/5 rounded-2xl p-8 text-center border border-primary/10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">Want the official source?</h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Download the full 2025 Nigeria Tax Act PDF to read the legal details yourself.
            </p>
            <a href="https://www.thecable.ng/wp-content/uploads/2026/01/Final-Approved-Copy-for-Print-NIGERIA-TAX-ACT-2025.pdf" target="_blank" rel="noopener noreferrer" className="inline-block">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                Download PDF
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>

          {/* Footer */}
          <footer className="border-t border-border pt-12 pb-8">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div>
                <div className="font-serif font-bold text-lg mb-4">newtaxlaws_ng</div>
                <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                  Helping Nigerians understand the 2026 financial landscape with clarity and accuracy.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                  <h4 className="font-semibold mb-3">Legal</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Disclaimer</li>
                    <li>Privacy Policy</li>
                    <li>Terms of Use</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Contact</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <a href="mailto:feedback@newtaxlaws.ng" className="hover:text-primary transition-colors">feedback@newtaxlaws.ng</a>
                    </li>
                    <li>Twitter</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-muted-foreground pt-8 border-t border-border/50">
              <p>&copy; 2026 newtaxlaws_ng. All rights reserved.</p>
              <p className="mt-2 text-muted-foreground/60">Not official financial advice. Consult a tax professional.</p>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
