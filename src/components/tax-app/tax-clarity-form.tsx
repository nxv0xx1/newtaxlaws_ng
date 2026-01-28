"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";

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
import { calculateTaxes } from "@/lib/tax-calculator";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  income: z.coerce.number().min(1, { message: "Please enter your income." }),
  period: z.enum(["monthly", "annually"]),
  source: z.enum(["salary", "business", "mixed"]),
  cashPercentage: z.number().min(0).max(100),
});

type FormData = z.infer<typeof formSchema>;
type PresetData = {
    income: number;
    period: 'monthly' | 'annually';
    source: 'salary' | 'business' | 'mixed';
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
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<{ taxBefore: number; taxAfter: number } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationFeedback, setCalculationFeedback] = useState<string[]>([]);
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

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

  const onSubmit = async (data: FormData) => {
      setIsCalculating(true);
      setCalculationFeedback([]);
      setResults(null);

      const feedbacks = [
        "checking the old tax rules...",
        "checking the new 2026 rules...",
        "comparing what you pay...",
      ];
      
      for (let i = 0; i < feedbacks.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setCalculationFeedback(prev => [...prev, feedbacks[i]]);
      }

      const { taxBefore, taxAfter } = calculateTaxes(data);
      
      setResults({ taxBefore, taxAfter });
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

  const handlePreset = (presetData: PresetData) => {
    const data: FormData = {
      income: presetData.income,
      period: presetData.period,
      source: presetData.source,
      cashPercentage: presetData.cashPercentage ?? form.getValues('cashPercentage'),
    };
    form.reset(data);
    onSubmit(data);
  };

  const formatCurrency = (amount: number) => {
    return `₦${new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };
  
  const difference = results ? results.taxAfter - results.taxBefore : 0;
  const periodDivisor = form.getValues('period') === 'monthly' ? 12 : 1;
  const isIncrease = difference > 0;

  const maxTaxForBar = results ? Math.max(results.taxBefore, results.taxAfter, 1) : 1;
  const barScale = 80; // Bars will take up to 80% of container width
  const beforeTaxWidth = results ? (results.taxBefore / maxTaxForBar) * barScale : 0;
  const afterTaxWidth = results ? (results.taxAfter / maxTaxForBar) * barScale : 0;
  const absDiffAmount = results ? Math.abs(difference) / periodDivisor : 0;
  
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

  return (
    <div ref={formContainerRef}>
      <div className="mb-12 space-y-6">
        <Prompt>Try a sample calculation (no typing needed!)</Prompt>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handlePreset({ income: 150000, period: 'monthly', source: 'salary' })}
            className="w-full text-left p-4 border-2 border-transparent hover:border-primary rounded-lg transition-colors bg-card space-y-1"
          >
            <p className="font-medium text-card-foreground">Example: ₦150k monthly salary</p>
            <p className="text-sm text-muted-foreground">See what happens to a regular salaried worker.</p>
          </button>
          <button
            type="button"
            onClick={() => handlePreset({ income: 2000000, period: 'annually', source: 'business', cashPercentage: 40 })}
            className="w-full text-left p-4 border-2 border-transparent hover:border-primary rounded-lg transition-colors bg-card space-y-1"
          >
            <p className="font-medium text-card-foreground">Example: ₦2m yearly from a business</p>
            <p className="text-sm text-muted-foreground">See how business income (especially cash payments) changes your tax.</p>
          </button>
          <button
            type="button"
            onClick={() => handlePreset({ income: 500000, period: 'monthly', source: 'mixed', cashPercentage: 25 })}
            className="w-full text-left p-4 border-2 border-transparent hover:border-primary rounded-lg transition-colors bg-card space-y-1"
          >
            <p className="font-medium text-card-foreground">Example: ₦500k monthly from different sources</p>
            <p className="text-sm text-muted-foreground">See what happens with mixed salary + business or side hustle income.</p>
          </button>
        </div>
      </div>
      
      <div className="mb-10">
        <Prompt>Or enter your own details below</Prompt>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            <Input type="number" placeholder="e.g., 150000" className="h-14 text-lg" {...field} value={field.value ?? ""} onBlur={handleIncomeBlur} />
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
                  <p className="text-xs text-muted-foreground pt-1">We'll automatically convert monthly ↔ yearly.</p>
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
            <div className="space-y-12 !mt-12">
              <div className="space-y-8">
                {/* Before */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-base text-muted-foreground">Old tax you paid ({form.getValues('period')}ly)</span>
                    <span className="text-2xl md:text-3xl font-semibold">{formatCurrency(results.taxBefore / periodDivisor)}</span>
                  </div>
                  <div className="bg-muted h-3 rounded-full">
                    <div className="bg-border h-3 rounded-full" style={{ width: `${beforeTaxWidth}%` }}></div>
                  </div>
                </div>

                {/* After */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-base text-muted-foreground">New tax you'll pay ({form.getValues('period')}ly)</span>
                    <span className={cn("text-2xl md:text-3xl font-semibold", isIncrease ? "text-destructive" : "text-primary")}>{formatCurrency(results.taxAfter / periodDivisor)}</span>
                  </div>
                  <div className="bg-muted h-3 rounded-full">
                    <div className={cn("h-3 rounded-full", isIncrease ? "bg-destructive" : "bg-primary")} style={{ width: `${afterTaxWidth}%` }}></div>
                  </div>
                </div>
              </div>
              
              {/* Difference */}
              <div className={cn("text-center space-y-2 rounded-lg p-6", isIncrease ? "bg-increase-background" : "bg-saving-background")}>
                  <p className={cn("text-3xl md:text-4xl font-bold tracking-tight", isIncrease ? "text-destructive" : "text-primary")}>
                      {isIncrease ? `You pay ${formatCurrency(absDiffAmount)} more` : `You save ${formatCurrency(absDiffAmount)}!`}
                  </p>
              </div>

              {/* Explanation */}
              <div className="space-y-4">
                <Prompt>Why this happened:</Prompt>
                <ul className="space-y-3 text-muted-foreground/90 pl-6">
                    <li className="flex items-start">
                        <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                        <span>The new rules mean the first ₦800,000 of your pay is now tax-free.</span>
                    </li>
                    {form.getValues('source') !== 'salary' && (
                        <li className="flex items-start">
                            <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                            <span>For business income, the cash part means less might be taxed in our estimate.</span>
                        </li>
                    )}
                    <li className="flex items-start">
                        <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                        <span>Tax rates for money earned above the tax-free amount have also changed.</span>
                    </li>
                </ul>
                <div className="text-xs text-muted-foreground pt-4">
                  <p><strong>Just so you know:</strong> This is a simple estimate. We guess that cash pay might lower your taxable amount. We don't include things like state taxes or personal claims.</p>
                </div>
              </div>

              <div className="text-center pt-8 space-y-2">
                <h3 className="font-medium text-foreground text-lg">Want the full story?</h3>
                <Button type="button" size="lg" onClick={() => console.log("Get detailed breakdown clicked")}>
                  Get your personal detailed report for ₦500
                </Button>
                <p className="text-sm text-muted-foreground !mt-1">
                  (includes exact breakdown, all assumptions, PDF you can keep)
                </p>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
