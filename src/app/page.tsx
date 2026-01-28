import { TaxClarityForm } from '@/components/tax-app/tax-clarity-form';

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
        </header>

        <TaxClarityForm />

        <footer className="mt-24 text-sm text-muted-foreground space-y-8">
          <div>
            <h2 className="font-medium text-foreground mb-2">About this tool</h2>
            <p className="leading-relaxed">
              This tool provides a simplified estimate of how recent tax law changes in Nigeria might affect your personal income tax. It is for informational purposes only and is not a substitute for professional legal or financial advice. The calculations are based on a simplified model and certain assumptions.
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
        </footer>
      </div>
    </main>
  );
}
