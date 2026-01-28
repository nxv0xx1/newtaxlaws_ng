"use client";

import { useState, useEffect, useRef } from "react";
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
import { calculateTaxes, TaxCalculationResult } from "@/lib/tax-calculator";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  income: z.coerce.number().min(1, { message: "Please enter your income." }),
  period: z.enum(["monthly", "annually"]),
  source: z.enum(["salary", "business", "mixed"]),
  cashPercentage: z.number().min(0).max(100),
});

type FormData = z.infer<typeof formSchema>;
type PresetKey = 'salary' | 'business' | 'mixed';
type PresetData = {
    income: number;
    period: 'monthly' | 'annually';
    source: PresetKey;
    cashPercentage?: number;
};


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
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<TaxCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationFeedback, setCalculationFeedback] = useState<string[]>([]);
  const [showReportCTA, setShowReportCTA] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetKey | null>(null);
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const samplesRef = useRef<HTMLDivElement>(null);
  const incomeInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      income: undefined,
      period: "monthly",
      source: "salary",
      cashPercentage: 20,
    },
    mode: "onBlur",
  });

  const source = form.watch("source");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const calculateAndShowResults = async (data: FormData) => {
      setIsCalculating(true);
      setCalculationFeedback([]);
      setResults(null);

      const feedbacks = [
        "running the 2026 numbers...",
        "breaking down the tax bands...",
        "finalizing your estimate...",
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

  const advanceStep = (currentStep: number) => {
    if (step === currentStep) {
      setStep(currentStep + 1);
    }
  };
  
  useEffect(() => {
    if (step > 0) {
      const nextSection = formContainerRef.current?.querySelector(`[data-section-id="${step}"]`);
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }
  }, [step]);
  
  const handleIncomeBlur = () => {
    form.trigger('income').then(isValid => {
      if (isValid) advanceStep(0);
    });
  };
  
  const handleRadioChange = (field: any, value: any, advanceFromStep: number) => {
      field.onChange(value);
      advanceStep(advanceFromStep);
  };

  const handlePreset = (presetKey: PresetKey, presetData: PresetData) => {
    setActivePreset(presetKey);
    setShowReportCTA(false);
    const data: FormData = {
      income: presetData.income,
      period: presetData.period,
      source: presetData.source,
      cashPercentage: presetData.cashPercentage ?? form.getValues('cashPercentage'),
    };
    form.reset(data);
    calculateAndShowResults(data);
  };
  
  const onManualSubmit = (data: FormData) => {
    setActivePreset(null);
    setShowReportCTA(true);
    calculateAndShowResults(data);
  }

  const resetForm = () => {
    setResults(null);
    setCalculationFeedback([]);
    setActivePreset(null);
    form.reset({
      income: undefined,
      period: "monthly",
      source: "salary",
      cashPercentage: 20,
    });
    setStep(0);
    if(samplesRef.current) {
      samplesRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  const handleTryOwnIncome = () => {
    const incomeSection = formContainerRef.current?.querySelector('[data-section-id="0"]');

    setResults(null);
    setCalculationFeedback([]);
    setActivePreset(null);
    form.reset({
        income: undefined,
        period: "monthly",
        source: "salary",
        cashPercentage: 20,
    });
    setStep(0);

    if (incomeSection) {
        incomeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            incomeInputRef.current?.focus();
        }, 300); // Delay focus to allow for scroll
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };
  
  const periodDivisor = form.getValues('period') === 'monthly' ? 12 : 1;
  const periodName = form.getValues('period');

  const renderSection = (s: number, children: React.ReactNode) => (
    <div
      data-section-id={s}
      className={cn(
        "transition-opacity duration-700 ease-in-out",
        step < s && "opacity-0 h-0 overflow-hidden pointer-events-none",
        s > 0 && "mt-10"
      )}
    >
      {children}
    </div>
  );

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
            className="w-full text-left p-4 border-2 border-transparent rounded-lg transition-colors bg-card space-y-1 data-[active=true]:border-primary data-[active=true]:bg-[#E6F4EA] hover:border-primary"
            data-active={activePreset === 'salary'}
          >
            <p className="font-medium text-card-foreground">Example: ₦150k monthly salary</p>
            <p className="text-sm text-muted-foreground">See what happens to a regular salaried worker.</p>
          </button>
          <button
            type="button"
            onClick={() => handlePreset('business', { income: 2000000, period: 'annually', source: 'business', cashPercentage: 40 })}
            className="w-full text-left p-4 border-2 border-transparent rounded-lg transition-colors bg-card space-y-1 data-[active=true]:border-primary data-[active=true]:bg-[#E6F4EA] hover:border-primary"
            data-active={activePreset === 'business'}
          >
            <p className="font-medium text-card-foreground">Example: ₦2m yearly from a business</p>
            <p className="text-sm text-muted-foreground">See how business income (especially cash payments) changes your tax.</p>
          </button>
          <button
            type="button"
            onClick={() => handlePreset('mixed', { income: 500000, period: 'monthly', source: 'mixed', cashPercentage: 25 })}
            className="w-full text-left p-4 border-2 border-transparent rounded-lg transition-colors bg-card space-y-1 data-[active=true]:border-primary data-[active=true]:bg-[#E6F4EA] hover:border-primary"
            data-active={activePreset === 'mixed'}
          >
            <p className="font-medium text-card-foreground">Example: ₦500k monthly from different sources</p>
            <p className="text-sm text-muted-foreground">See what happens with mixed salary + business or side hustle income.</p>
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
          <div className={cn("space-y-10 transition-opacity duration-500", (isCalculating || results) ? 'opacity-50' : 'opacity-100')}>
            {renderSection(0, 
              <div className="space-y-4">
                  <Prompt>How much do you earn each month or year?</Prompt>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <FormField
                      control={form.control}
                      name="income"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input ref={incomeInputRef} type="number" placeholder="e.g., 150000" className="h-14 text-lg" {...field} value={field.value ?? ""} onBlur={handleIncomeBlur} />
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
                            <RadioGroup onValueChange={(v) => handleRadioChange(field, v, 0)} defaultValue={field.value} className="flex items-center space-x-6">
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
            )}

            {renderSection(1, 
              <div className="space-y-4">
                <Prompt>Where does your money come from?</Prompt>
                 <p className="text-xs text-muted-foreground -mt-2">Salary is easy to track. For business/mixed income, we'll help you guess the cash part below.</p>
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup 
                          onValueChange={(v: "salary" | "business" | "mixed") => {
                            field.onChange(v);
                            if (v === 'salary') {
                              advanceStep(1);
                              setStep(3);
                            } else {
                              advanceStep(1);
                            }
                          }}
                          defaultValue={field.value} className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          
                            <FormItem>
                              <FormControl><RadioGroupItem value='salary' className="sr-only peer" /></FormControl>
                              <Label className="flex h-full items-center justify-center text-center p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-primary/5 transition-colors">
                                Salary job
                              </Label>
                            </FormItem>
                            <FormItem>
                              <FormControl><RadioGroupItem value='business' className="sr-only peer" /></FormControl>
                              <Label className="flex h-full items-center justify-center text-center p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-primary/5 transition-colors">
                                My own business
                              </Label>
                            </FormItem>
                            <FormItem>
                              <FormControl><RadioGroupItem value='mixed' className="sr-only peer" /></FormControl>
                              <Label className="flex h-full items-center justify-center text-center p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-primary/5 transition-colors">
                                A mix of both
                              </Label>
                            </FormItem>
                          
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {source !== 'salary' && renderSection(2,
              <div className="space-y-4">
                <Prompt>How much of your pay is cash? ({form.watch('cashPercentage')}%)</Prompt>
                 <p className="text-xs text-muted-foreground -mt-2">Many business owners receive some money in cash. We make a simple guess on how much the tax office might not see — this can lower the tax estimate a bit.</p>
                <FormField
                  control={form.control}
                  name="cashPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Slider defaultValue={[field.value]} max={100} step={5} onValueChange={value => field.onChange(value[0])} onValueCommit={() => advanceStep(2)} />
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
            
            {(step >= 2 && source !== 'salary' || step >=1 && source === 'salary') && renderSection(3, <Button type="submit" disabled={isCalculating} className="w-full md:w-auto !mt-12">
                {isCalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                See My Tax Change
            </Button>
            )}
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
                  <Button variant="ghost" size="icon" onClick={resetForm} className="absolute -top-4 -right-2 h-8 w-8 text-muted-foreground rounded-full hover:bg-muted">
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
                  <p className="text-2xl font-bold">{formatCurrency(results.netIncome / periodDivisor)}
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
                  <p className="text-xs text-center text-muted-foreground mb-2">Your annual income by tax band</p>
                  <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted">
                      {results.breakdown.map((item, index) => {
                          const colors = ["bg-primary/20", "bg-primary/40", "bg-primary/60", "bg-primary/80", "bg-primary"];
                          if (item.taxable <= 0) return null;
                          return (
                              <div
                                  key={index}
                                  className={colors[index % colors.length]}
                                  style={{ width: `${(item.taxable / results.annualIncome) * 100}%` }}
                                  title={`${item.bandDescription} taxed at ${item.rate * 100}%`}
                              />
                          );
                      })}
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

              {/* Explanation */}
              <div className="space-y-4">
                <Prompt>Why this happens:</Prompt>
                <ul className="space-y-3 text-muted-foreground/90 pl-6">
                    <li className="flex items-start">
                        <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                        <span>The biggest change: the first ₦800,000 of your annual income is now 100% tax-free.</span>
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
                <div className="text-xs text-muted-foreground pt-4">
                  <p>Simplified federal estimate using 2026 rules. Ignores personal reliefs, deductions, state taxes.</p>
                </div>
              </div>

              {activePreset && (
                <div className="!mt-12 text-center space-y-3">
                  <p className="text-muted-foreground">
                    This is an example. Want to see exactly what you'll pay with your real income?
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
                  
                  <h3 className="mt-4 text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                    Get your detailed personal report — ₦500
                  </h3>
                  
                  <div className="mt-6 max-w-sm mx-auto text-left">
                    <ul className="space-y-2 text-muted-foreground/90">
                        <li className="flex items-start">
                            <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/50"></span>
                            <span>Step-by-step before vs after calculation</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/50"></span>
                            <span>All assumptions explained</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/50"></span>
                            <span>Simple chart of your tax bands</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/50"></span>
                            <span>Downloadable PDF</span>
                        </li>
                    </ul>
                  </div>
                  
                  <div className="mt-8">
                    <Button 
                      type="button" 
                      size="lg" 
                      onClick={() => console.log("Get My Report clicked")}
                      className="hover:scale-[1.02] hover:shadow-md active:scale-100 transition-transform duration-150"
                    >
                      Get My Report
                      <ArrowRight className="ml-2" />
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
