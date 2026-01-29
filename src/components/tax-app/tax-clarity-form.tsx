"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { calculateTaxes, calculateOldTaxes, TaxCalculationResult } from "@/lib/tax-calculator";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  income: z.coerce.number().min(1, { message: "Please enter your income." }),
  period: z.enum(["monthly", "annually"]),
  source: z.enum(["salary", "business", "mixed"]),
  cashPercentage: z.number().min(0).max(100),
  businessIncomePercentage: z.number().min(0).max(100),
});

type FormData = z.infer<typeof formSchema>;
type PresetKey = 'salary' | 'business' | 'mixed';
type PresetData = {
    income: number;
    period: 'monthly' | 'annually';
    source: PresetKey;
    cashPercentage?: number;
    businessIncomePercentage?: number;
};

// Declare PaystackPop type for TypeScript
interface PaystackPop {
  setup(options: PaystackOptions): {
    openIframe(): void;
  };
}
interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  ref?: string;
  onClose: () => void;
  callback: (response: { reference: string }) => void;
}
declare global {
  interface Window {
    PaystackPop: PaystackPop;
  }
}

const Prompt = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 text-foreground font-code">
    <span className="text-primary">{">"}</span>
    <span>{children}</span>
  </div>
);

const BlinkingCursor = () => (
  <span className="inline-block h-4 w-2 ml-1 animate-blinking-cursor" />
);

export function TaxClarityForm() {
  const [isClient, setIsClient] = useState(false);
  const [results, setResults] = useState<TaxCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationFeedback, setCalculationFeedback] = useState<string[]>([]);
  const [showReportCTA, setShowReportCTA] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetKey | null>(null);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [isInputGlowing, setIsInputGlowing] = useState(false);
  const [emailForReport, setEmailForReport] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const samplesRef = useRef<HTMLDivElement>(null);
  const incomeInputRef = useRef<HTMLInputElement>(null);
  const incomeContainerRef = useRef<HTMLDivElement>(null);


  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      income: undefined,
      period: "monthly",
      source: "salary",
      cashPercentage: 0,
      businessIncomePercentage: 50,
    },
    mode: "onChange",
  });

  const source = form.watch("source");

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (source === 'salary') {
      form.setValue('businessIncomePercentage', 0);
      form.setValue('cashPercentage', 0);
    } else if (source === 'business') {
      form.setValue('businessIncomePercentage', 100);
      if (form.getValues('cashPercentage') === 0) {
        form.setValue('cashPercentage', 50);
      }
    } else if (source === 'mixed') {
      if(form.getValues('businessIncomePercentage') === 0 || form.getValues('businessIncomePercentage') === 100) {
        form.setValue('businessIncomePercentage', 50);
      }
       if (form.getValues('cashPercentage') === 0) {
        form.setValue('cashPercentage', 40);
      }
    }
  }, [source, form]);


  useEffect(() => {
    if (results && !isCalculating) {
      const timer = setTimeout(() => setIsResultsVisible(true), 100);
      return () => clearTimeout(timer);
    }
    if (!results) {
      setIsResultsVisible(false);
    }
  }, [results, isCalculating]);

  const calculateAndShowResults = async (data: FormData) => {
      setIsCalculating(true);
      setCalculationFeedback([]);
      setResults(null);
      
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100)


      const feedbacks = [
        "checking the shiny new 2026 rules...",
        "applying bands...",
        "doing the final sum...",
        "here is your future tax bill...",
      ];
      
      for (let i = 0; i < feedbacks.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setCalculationFeedback(prev => [...prev, feedbacks[i]]);
      }

      const taxResult = calculateTaxes(data);
      
      setResults(taxResult);
      setIsCalculating(false);
  };
  
  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [results]);

  const handlePreset = (presetKey: PresetKey, presetData: PresetData) => {
    setActivePreset(presetKey);
    setShowReportCTA(false);
    const data: FormData = {
      income: presetData.income,
      period: presetData.period,
      source: presetData.source,
      cashPercentage: presetData.cashPercentage ?? 0,
      businessIncomePercentage: presetData.businessIncomePercentage ?? 50,
    };
    form.reset(data);
    calculateAndShowResults(data);
  };
  
  const onManualSubmit = (data: FormData) => {
    setActivePreset(null);
    setShowReportCTA(true);
    calculateAndShowResults(data);
  }

  const resetForm = (scrollToTop = true) => {
    setResults(null);
    setCalculationFeedback([]);
    setActivePreset(null);
    setShowReportCTA(false);
    form.reset({
      income: undefined,
      period: "monthly",
      source: "salary",
      cashPercentage: 0,
      businessIncomePercentage: 50,
    });
     if(scrollToTop && formContainerRef.current) {
      formContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  const handleTryOwnIncome = () => {
    resetForm(false);
    if (incomeContainerRef.current) {
        incomeContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            if(incomeInputRef.current) {
              incomeInputRef.current.focus();
              setIsInputGlowing(true);
              setTimeout(() => setIsInputGlowing(false), 2000);
            }
        }, 300);
    }
  };

  const handlePayment = () => {
    if (!emailForReport || !/^\S+@\S+\.\S+$/.test(emailForReport)) {
        toast({
            variant: "destructive",
            title: "Invalid Email",
            description: "Please enter a valid email address.",
        });
        return;
    }
    
    setIsPaying(true);

    if (!results) {
        toast({ variant: "destructive", title: "Error", description: "Calculation data is missing."});
        setIsPaying(false);
        return;
    }

    const formData = form.getValues();
    const oldTaxResults = calculateOldTaxes(formData);

    const reportData = {
        formData,
        newTaxResults: results,
        oldTaxResults,
    };

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_live_a57cfe506f43c31aa18c093b3bec333c74d4ec78',
      email: emailForReport,
      amount: 50000, // ₦500 in kobo
      onClose: () => {
        toast({
            title: "Payment Cancelled",
            description: "You have cancelled the payment.",
        });
        setIsPaying(false);
      },
      callback: async (response) => {
        toast({
            title: "Verifying Payment...",
            description: "Please wait while we confirm your payment.",
        });

        try {
            sessionStorage.setItem('reportData', JSON.stringify(reportData));
            router.push(`/report?ref=${response.reference}`);
        } catch (e) {
            console.error("Could not set session storage or redirect", e);
            toast({
                variant: "destructive",
                title: "Failed to prepare report",
                description: "There was an error preparing your report data. Please contact support.",
            });
            setIsPaying(false);
        }
      },
    });
    handler.openIframe();
  };

  const formatCurrency = (amount: number) => {
    return `₦${new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };
  
  const periodDivisor = form.getValues('period') === 'monthly' ? 12 : 1;
  const periodName = form.getValues('period');

  if (!isClient) {
    return null;
  }

  return (
    <div ref={formContainerRef}>
      <div ref={samplesRef} className="mb-12 space-y-6">
        <Prompt>Try a sample calculation (no typing needed!)</Prompt>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handlePreset('salary', { income: 150000, period: 'monthly', source: 'salary' })}
            className="w-full text-left p-4 border-2 rounded-lg transition-colors bg-card space-y-1 data-[active=true]:border-primary data-[active=true]:bg-[#E6F4EA] hover:border-primary"
            data-active={activePreset === 'salary'}
          >
            <p className="font-medium text-card-foreground">Example: ₦150k monthly salary</p>
            <p className="text-sm text-muted-foreground">See what happens to a regular salaried worker.</p>
          </button>
          <button
            type="button"
            onClick={() => handlePreset('business', { income: 2000000, period: 'annually', source: 'business', cashPercentage: 50 })}
            className="w-full text-left p-4 border-2 rounded-lg transition-colors bg-card space-y-1 data-[active=true]:border-primary data-[active=true]:bg-[#E6F4EA] hover:border-primary"
            data-active={activePreset === 'business'}
          >
            <p className="font-medium text-card-foreground">Example: ₦2m yearly from a business</p>
            <p className="text-sm text-muted-foreground">See how business income changes your tax.</p>
          </button>
          <button
            type="button"
            onClick={() => handlePreset('mixed', { income: 500000, period: 'monthly', source: 'mixed', cashPercentage: 40, businessIncomePercentage: 50 })}
            className="w-full text-left p-4 border-2 rounded-lg transition-colors bg-card space-y-1 data-[active=true]:border-primary data-[active=true]:bg-[#E6F4EA] hover:border-primary"
            data-active={activePreset === 'mixed'}
          >
            <p className="font-medium text-card-foreground">Example: ₦500k monthly from different sources</p>
            <p className="text-sm text-muted-foreground">See what happens with mixed income.</p>
          </button>
        </div>
      </div>
      
      <div className="my-16 text-center">
        <h2 className="text-xl font-medium text-primary">
          Want to see what happens to your money?
        </h2>
        <p className="mt-2 text-muted-foreground">
          Enter your income below (takes about 10 seconds)
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onManualSubmit)} className="space-y-6">
          <div className={cn("space-y-10 transition-opacity duration-500", (isCalculating || results) ? 'opacity-50 pointer-events-none' : 'opacity-100')}>
            <div ref={incomeContainerRef} className="space-y-4">
                <Prompt>How much do you earn each month or year?</Prompt>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <FormField
                    control={form.control}
                    name="income"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input ref={incomeInputRef} type="number" placeholder="e.g., 150000" className={cn("h-14 text-lg", isInputGlowing && "highlight-glow")} {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem className="pt-1">
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-6">
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="monthly" /></FormControl>
                              <Label className="font-normal cursor-pointer">Monthly</Label>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="annually" /></FormControl>
                              <Label className="font-normal cursor-pointer">Annually</Label>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground pt-1">We'll figure out monthly ↔ yearly for you.</p>
            </div>

            <div className="space-y-4">
              <Prompt>Where does your money come from?</Prompt>
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-1 md:grid-cols-3 gap-3"
                      >
                        <div>
                          <RadioGroupItem value="salary" id="source-salary" className="sr-only peer" />
                          <Label
                            htmlFor="source-salary"
                            className="flex h-full items-center justify-center text-center p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-primary/5 transition-colors"
                          >
                            Salary job
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="business" id="source-business" className="sr-only peer" />
                          <Label
                            htmlFor="source-business"
                            className="flex h-full items-center justify-center text-center p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-primary/5 transition-colors"
                          >
                            My own business
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="mixed" id="source-mixed" className="sr-only peer" />
                          <Label
                            htmlFor="source-mixed"
                            className="flex h-full items-center justify-center text-center p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-primary/5 transition-colors"
                          >
                            A mix of both
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {source === 'mixed' && (
              <div className="space-y-4">
                <Prompt>What's the mix? ({form.watch('businessIncomePercentage')}%)</Prompt>
                <p className="text-xs text-muted-foreground -mt-2">Drag the slider to show how your income is split between salary and business.</p>
                <FormField
                  control={form.control}
                  name="businessIncomePercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Slider
                          value={[field.value || 50]}
                          max={100}
                          step={5}
                          onValueChange={value => field.onChange(value[0])}
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Mostly Salary</span>
                        <span>Mostly Business</span>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {source !== 'salary' && (
              <div className="space-y-4">
                <Prompt>
                  {source === 'business'
                    ? `Estimate % received as cash (${form.watch('cashPercentage')}%)`
                    : `Of the business part, what % is cash? (${form.watch('cashPercentage')}%)`}
                </Prompt>
                 <p className="text-xs text-muted-foreground -mt-2">
                   {source === 'business' 
                     ? "Common for business owners. We make a simple guess on how this affects your tax."
                     : "Estimate the cash portion of your side hustle. This can affect the tax estimate."
                   }
                 </p>
                <FormField
                  control={form.control}
                  name="cashPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Slider 
                          value={[field.value]} 
                          max={100} 
                          step={5} 
                          onValueChange={value => field.onChange(value[0])} 
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Almost No Cash</span>
                        <span>Almost All Cash</span>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <Button type="submit" size="lg" disabled={isCalculating} className="w-full !mt-12 h-14">
                {isCalculating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  "Calculate My Tax"
                )}
            </Button>
          </div>

          {(isCalculating || results) && (
            <div className="!mt-16 space-y-2" ref={resultsRef}>
                {calculationFeedback.map((fb, index) => (
                  <div key={index} className="flex items-center gap-2 text-muted-foreground">
                    <span>{">"}</span>
                    <span>{fb}</span>
                    {isCalculating && index === calculationFeedback.length - 1 && <BlinkingCursor />}
                  </div>
                ))}
            </div>
          )}

          {results && !isCalculating && (
            <div className="relative space-y-8 !mt-12">
              {activePreset && (
                  <Button variant="ghost" size="icon" onClick={() => resetForm()} className="absolute -top-4 -right-2 h-8 w-8 text-muted-foreground rounded-full hover:bg-muted">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Clear results</span>
                  </Button>
              )}

              <h3 className="text-xl font-semibold text-center text-foreground">Your estimated tax under 2026 rules</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">You will pay</p>
                  <p className="text-2xl font-bold">{formatCurrency(results.totalTax / periodDivisor)}
                    <span className="text-sm font-normal">/{periodName === 'monthly' ? 'month' : 'year'}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">({formatCurrency(results.totalTax)}/year)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">You keep</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(results.netIncome / periodDivisor)}
                    <span className="text-sm font-normal">/{periodName === 'monthly' ? 'month' : 'year'}</span>
                  </p>
                   <p className="text-xs text-muted-foreground">({formatCurrency(results.netIncome)}/year)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Effective tax rate</p>
                  <p className="text-2xl font-bold">{results.effectiveRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground invisible">placeholder</p>
                </div>
              </div>

              <div>
                  <p className="text-xs text-center text-muted-foreground mb-2">Your annual taxable income by tax band</p>
                  <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted">
                      {results.breakdown.map((item, index) => {
                          const colors = ["bg-primary/20", "bg-primary/40", "bg-primary/60", "bg-primary/80", "bg-primary"];
                          if (item.taxable <= 0) return null;
                          const widthPercent = (item.taxable / results.taxableIncome) * 100;
                          return (
                              <div
                                  key={index}
                                  className={cn(colors[index % colors.length], "transition-all duration-1000 ease-out")}
                                  style={{ width: isResultsVisible ? `${widthPercent}%` : '0%' }}
                                  title={`${item.bandDescription} taxed at ${item.rate * 100}%`}
                              />
                          );
                      })}
                  </div>
                   <div className="flex justify-between text-xs font-code text-muted-foreground mt-1 px-1">
                      <span>₦0</span>
                      <span>{formatCurrency(results.taxableIncome)}</span>
                  </div>
              </div>

              <div className="space-y-4 rounded-lg bg-card p-4">
                <h4 className="font-medium">How we calculated it:</h4>
                <ul className="space-y-2 text-sm">
                  {results.breakdown.map((item, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>
                        {item.bandDescription} at <span className="font-medium">{item.rate * 100}%</span>
                      </span>
                      <span className="font-medium font-code">{formatCurrency(item.tax)}</span>
                    </li>
                  ))}
                   <li className="flex justify-between border-t pt-2 mt-2 font-bold text-base">
                      <span>Total Annual Tax</span>
                      <span>{formatCurrency(results.totalTax)}</span>
                  </li>
                </ul>
              </div>

              <div className="text-xs text-center text-muted-foreground">
                <p>Simplified federal estimate using 2026 rules. Ignores personal reliefs, deductions, state taxes.</p>
              </div>

              {/* Explanation */}
              <div className="space-y-4 !mt-12">
                <Prompt>Why this happens:</Prompt>
                <ul className="space-y-3 text-muted-foreground/90 pl-6">
                    <li className="flex items-start">
                        <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                        <span>The biggest change: the first ₦800,000 of your annual taxable income is now 100% tax-free.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                        <span>New tax rates only apply to the money you earn *above* that tax-free amount.</span>
                    </li>
                    {form.getValues('source') !== 'salary' && (
                        <li className="flex items-start">
                            <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                            <span>For business income, we assume a portion is in cash, which can affect the final estimate.</span>
                        </li>
                    )}
                </ul>
              </div>

              {activePreset && (
                <div className="!mt-12 text-center space-y-3">
                  <p className="text-muted-foreground">
                    This is an example. Want to see what you'll pay with your real income?
                  </p>
                  <Button onClick={handleTryOwnIncome} size="lg" className="hover:scale-[1.02] hover:shadow-md active:scale-100 transition-transform duration-150">
                      Try with my own income
                      <ArrowRight className="ml-2" />
                  </Button>
                </div>
              )}

              {/* CTA for detailed report */}
              {showReportCTA && (
                <div className="!mt-20 md:!mt-24 text-center">
                  <div className="inline-block">
                    <Prompt>Want the full story for your situation?</Prompt>
                  </div>
                  
                  <h3 className="mt-4 text-2xl md:text-3xl font-semibold text-foreground tracking-tight max-w-lg mx-auto">
                    For just ₦500, unlock your personalized 2026 Tax Report.
                  </h3>
                  
                  <div className="mt-6 max-w-sm mx-auto text-left">
                     <p className="font-medium text-foreground mb-3">What you'll get:</p>
                    <ul className="space-y-2 text-muted-foreground/90">
                        {[
                            "Complete tax band breakdown",
                            "Monthly and annual take-home pay summary",
                            "Effective tax rate",
                            "All assumptions explained",
                            "Clean, printable layout",
                        ].map((item, i) => (
                            <li key={i} className="flex items-start">
                                <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/50"></span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                  </div>

                  <div className="mt-8 max-w-sm mx-auto text-left">
                    <Label htmlFor="email-report" className="font-medium">Your email</Label>
                    <Input 
                        id="email-report"
                        type="email"
                        placeholder="you@example.com"
                        value={emailForReport}
                        onChange={(e) => setEmailForReport(e.target.value)}
                        className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                        Required to get your detailed report and receipt.
                    </p>
                  </div>
                  
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <Button 
                      type="button" 
                      size="lg"
                      variant="outline"
                      onClick={handleTryOwnIncome}
                    >
                      Recalculate
                    </Button>
                    <Button 
                      type="button" 
                      size="lg" 
                      onClick={handlePayment}
                      disabled={isPaying}
                      className="hover:scale-[1.02] hover:shadow-md active:scale-100 transition-transform duration-150"
                    >
                      {isPaying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Get My Report — ₦500
                          <ArrowRight className="ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
