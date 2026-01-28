import { TaxClarityForm } from '@/components/tax-app/tax-clarity-form';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen font-body bg-background text-foreground">
      <div className="container mx-auto max-w-2xl px-4 py-16 sm:py-24">
        <header className="text-left mb-12">
          <h1 className="font-headline text-2xl font-medium">
            newtaxlaws_ng
            <span style={{ color: 'hsl(var(--primary))' }}>.</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            See how the new tax laws affect your money.
          </p>
          
          <div className="mt-8 space-y-6">
            <p className="leading-relaxed text-muted-foreground/90">
              Taxes in Nigeria often feel as predictable as Lagos traffic at rush hour — confusing, stressful, and full of surprises. The 2026 reforms introduce a higher tax-free threshold (₦800,000 annually) and more progressive rates to simplify things and give low earners relief.
            </p>
            
            <div className="space-y-3">
                <div className="font-code text-muted-foreground">
                    <span className="text-primary">{'>'}</span> Want the full official text?
                </div>
                <a href="https://www.premiumtimesng.com/news/top-news/847380-download-certified-true-copies-of-nigerias-new-tax-laws.html" target="_blank" rel="noopener noreferrer" className="inline-block">
                    <Button className="hover:scale-[1.02] hover:shadow-md active:scale-100 transition-transform duration-150">
                        Download Tax Laws PDFs
                        <ArrowRight className="ml-2" />
                    </Button>
                </a>
            </div>
          </div>
        </header>

        <div className="mb-12 space-y-4">
          <div className="font-code text-muted-foreground">
              <span className="text-primary">{'>'}</span> Key changes starting 2026 (simplified):
          </div>
          <ul className="space-y-3 text-muted-foreground/90 pl-6">
              <li className="flex items-start">
                  <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                  <span>₦800,000 annual tax-free threshold for individuals.</span>
              </li>
              <li className="flex items-start">
                  <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                  <span>Progressive rates: 0% on first ₦800k, then 15% on next bands, higher rates (up to ~25%) for high earners.</span>
              </li>
              <li className="flex items-start">
                  <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                  <span>More relief for low-income & minimum wage earners.</span>
              </li>
              <li className="flex items-start">
                  <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                  <span>Tool assumes cash portion of business/mixed income may affect taxable base.</span>
              </li>
          </ul>
        </div>

        <TaxClarityForm />

        <footer className="mt-24 text-sm text-muted-foreground space-y-8">
          <div>
            <h2 className="font-medium text-foreground mb-2">About this tool</h2>
            <p className="leading-relaxed">
              This free tool gives a quick, simplified estimate of how 2026 personal income tax changes affect your take-home pay. Built for clarity, not advice. Independent — not affiliated with government.
            </p>
          </div>
          <div>
            <h2 className="font-medium text-foreground mb-2">Disclaimer</h2>
            <p className="leading-relaxed">
              We are not financial advisors. The information provided here is not legal or tax advice. Consult with a qualified professional for advice tailored to your specific situation. We are not liable for any decisions made based on the information from this tool.
            </p>
          </div>
          <p>
            Feedback or questions?{' '}
            <a href="mailto:feedback@newtaxlaws.ng" className="underline hover:text-primary transition-colors">
              Contact us
            </a>
            .
          </p>
          <p className="text-center text-xs pt-8 text-muted-foreground/80">
            &copy; 2026 newtaxlaws_ng. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}
