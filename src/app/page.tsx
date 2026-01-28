import { TaxClarityForm } from '@/components/tax-app/tax-clarity-form';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

          <Accordion type="single" collapsible className="w-full pt-4">
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger className="text-muted-foreground hover:no-underline font-normal justify-start p-0 text-left">
                <div className="flex items-center gap-2 font-code">
                  <span className="text-primary">{'>'}</span>
                  <span>Tap for more details — who else benefits (or pays a bit more)?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-6 pl-2 space-y-8 text-muted-foreground/90">

                <div className="space-y-3">
                  <h3 className="font-bold text-foreground text-base">For everyday people & workers</h3>
                  <ul className="space-y-3 pl-6">
                    <li className="flex items-start">
                      <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                      <span>The first ₦800,000 you earn each year is now tax-free.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                      <span>You pay 0% on first ₦800k, then rates start at 15% on the next chunk (up to ₦3m total income), then 18%, 21%, 23%, up to 25% for very high earners.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                      <span>Low earners pay much less — or nothing at all.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                      <span>You can now subtract 20% of your rent (up to ₦500,000 max) from taxable income — big help in cities like Abuja.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                      <span>Interest on business loans you borrow can be subtracted to lower your tax.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                      <span>Loans (personal or business) are not taxed as income.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                      <span>Donations to approved charities can reduce your tax bill.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                      <span>Money your business spends on research can be subtracted.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                      <span>Basic food, medicine, books, school fees, certain medical services stay VAT-free (no 7.5% add-on).</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                      <span>If you lose your job or get injured, compensation up to ₦50 million is tax-free.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-foreground text-base">For small shops, side hustles & tiny businesses</h3>
                  <ul className="space-y-3 pl-6">
                    <li className="flex items-start">
                      <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                      <span>If your business sells less than ₦100 million/year and assets under ₦250 million — you pay 0% company tax.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                      <span>Many small businesses skip the new 4% development levy entirely.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                      <span>You can use simple "presumptive tax" — pay a small flat % of sales instead of complicated profit calculations.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-bold text-foreground text-base">For bigger companies & foreign ones</h3>
                  <ul className="space-y-3 pl-6">
                    <li className="flex items-start">
                      <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                      <span>Companies making over ₦100 million/year pay 30% on profits.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                      <span>All companies pay a new 4% development levy (replaces old scattered fees).</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                      <span>Very big international companies must pay at least 15% overall tax — or top up.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                      <span>Gains from selling assets now taxed at 30% (was 10%).</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                      <span>Foreign companies pay tax only on money made in Nigeria.</span>
                    </li>
                  </ul>
                </div>

                <p className="text-xs text-muted-foreground/80 pt-4">
                  Simplified from Nigeria Tax Act 2025 — full details in the official PDF above.
                </p>

              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
