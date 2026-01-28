import { TaxClarityForm } from '@/components/tax-app/tax-clarity-form';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen font-body bg-background text-foreground">
      <div className="container mx-auto max-w-2xl px-4 py-16 sm:py-24">
        <header className="text-left mb-12">
          <h1 className="font-headline text-2xl font-medium text-black">
            newtaxlaws_ng
            <span style={{ color: 'hsl(var(--primary))' }}>.</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            See how the new tax laws affect your money.
          </p>
          
          <div className="mt-8 space-y-6">
            <p className="leading-relaxed text-muted-foreground/90">
              Taxes in Nigeria can be a headache, like Lagos traffic. New rules in 2026 are meant to make it simpler. Now the first ₦800,000 you earn in a year is completely tax-free (you pay ₦0 on it).
            </p>
            
            <div className="space-y-3">
                <div className="font-code text-muted-foreground">
                    <span className="text-primary">{'>'}</span> Want the official government document?
                </div>
                <a href="https://www.thecable.ng/wp-content/uploads/2026/01/Final-Approved-Copy-for-Print-NIGERIA-TAX-ACT-2025.pdf" target="_blank" rel="noopener noreferrer" className="inline-block">
                    <Button className="hover:scale-[1.02] hover:shadow-md active:scale-100 transition-transform duration-150">
                        Download New Tax Laws (PDF)
                        <ArrowRight className="ml-2" />
                    </Button>
                </a>
            </div>
          </div>
        </header>

        <div className="mb-12 space-y-4">
          <div className="font-code text-muted-foreground">
              <span className="text-primary">{'>'}</span> What's new in 2026 (the simple version):
          </div>
          <ul className="space-y-3 text-muted-foreground/90 pl-6">
              <li className="flex items-start">
                  <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                  <span>The first ₦800,000 you earn each year is now tax-free.</span>
              </li>
              <li className="flex items-start">
                  <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                  <span>You pay 0% tax on your first ₦800k. After that, you only pay tax on the money you earn above that amount.</span>
              </li>
              <li className="flex items-start">
                  <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                  <span>People who earn less will pay much less tax, or none at all.</span>
              </li>
              <li className="flex items-start">
                  <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                  <span>If you get paid in cash, this tool makes a smart guess on how it affects your tax.</span>
              </li>
          </ul>
        </div>

        <TaxClarityForm />

        <footer className="mt-24 text-sm text-muted-foreground space-y-8">
          <div>
            <h2 className="font-medium text-foreground mb-2">About this tool</h2>
            <p className="leading-relaxed">
              This free tool gives a quick guess on how the new 2026 tax rules might change the money you take home. It's for information only, not financial advice. We're not part of the government.
            </p>
          </div>
          <div>
            <h2 className="font-medium text-foreground mb-2">Disclaimer</h2>
            <p className="leading-relaxed">
             We are not money experts. This is not official tax advice. Please talk to a real tax professional for help with your own money situation. Any choices you make based on this tool are your own.
            </p>
          </div>
          <p>
            Got questions or ideas?{' '}
            <a href="mailto:feedback@newtaxlaws.ng" className="underline hover:text-primary transition-colors">
              Send us an email
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
