import { TaxClarityForm } from '@/components/tax-app/tax-clarity-form';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen font-body bg-background text-foreground">
      <div className="container mx-auto max-w-2xl px-4 py-16 sm:py-24">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-black tracking-tight">
            newtaxlaws_ng
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            See how the new 2026 tax laws affect your money.
          </p>

          <div className="mt-8 flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center h-4 w-4 rounded-full bg-muted text-muted-foreground text-[10px] font-bold ring-1 ring-inset ring-border">1</span>
              <span>See what's new in 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center h-4 w-4 rounded-full bg-muted text-muted-foreground text-[10px] font-bold ring-1 ring-inset ring-border">2</span>
              <span>Try a sample (fastest way)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center h-4 w-4 rounded-full bg-muted text-muted-foreground text-[10px] font-bold ring-1 ring-inset ring-border">3</span>
              <span>Enter your own numbers → see your result</span>
            </div>
          </div>
          
          <div className="mt-8 space-y-6 text-left">
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
