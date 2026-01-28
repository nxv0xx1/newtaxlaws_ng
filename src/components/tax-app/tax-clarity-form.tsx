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
        "applying pre-2026 tax rules...",
        "applying new tax laws...",
        "comparing outcomes...",
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
  const percentageChange = results && results.taxBefore > 0 ? (difference / results.taxBefore) * 100 : results && results.taxAfter > 0 ? 100 : 0;
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
        <Prompt>See it in action — try a sample (no typing needed!)</Prompt>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handlePreset({ income: 150000, period: 'monthly', source: 'salary' })}
            className="w-full text-left p-4 border-2 border-transparent hover:border-primary rounded-lg transition-colors bg-card space-y-1"
          >
            <p className="font-medium text-card-foreground">Sample: ₦150k/month Salary</p>
            <p className="text-sm text-muted-foreground">Preview: See how the new bands affect a salaried earner.</p>
          </button>
          <button
            type="button"
            onClick={() => handlePreset({ income: 2000000, period: 'annually', source: 'business', cashPercentage: 40 })}
            className="w-full text-left p-4 border-2 border-transparent hover:border-primary rounded-lg transition-colors bg-card space-y-1"
          >
            <p className="font-medium text-card-foreground">Sample: ₦2m/year Business</p>
            <p className="text-sm text-muted-foreground">Preview: Explore how cash income estimates change your tax.</p>
          </button>
          <button
            type="button"
            onClick={() => handlePreset({ income: 500000, period: 'monthly', source: 'mixed', cashPercentage: 25 })}
            className="w-full text-left p-4 border-2 border-transparent hover:border-primary rounded-lg transition-colors bg-card space-y-1"
          >
            <p className="font-medium text-card-foreground">Sample: ₦500k/month Mixed</p>
            <p className="text-sm text-muted-foreground">Preview: Understand the impact on combined income sources.</p>
          </button>
        </div>
      </div>
      
      <div className="mb-10">
        <Prompt>Or enter your own income</Prompt>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className={cn("space-y-10 transition-opacity duration-500", (isCalculating || results) ? 'opacity-50' : 'opacity-100')}>
            {renderSection(0, 
              <div className="space-y-4">
                  <Prompt>Enter your income</Prompt>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <FormField
                      control={form.control}
                      name="income"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="number" placeholder="e.g. 150000" className="text-base" {...field} value={field.value ?? ""} onBlur={handleIncomeBlur} />
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
                  <p className="text-xs text-muted-foreground pt-1">Monthly or annual? We convert automatically.</p>
              </div>
            )}

            {renderSection(1, 
              <div className="space-y-4">
                <Prompt>Select income source</Prompt>
                 <p className="text-xs text-muted-foreground -mt-2">Salary: fully traceable | Business/mixed: estimate cash portion below.</p>
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
                          {['salary', 'business', 'mixed'].map(source => (
                            <FormItem key={source}>
                              <FormControl><RadioGroupItem value={source} className="sr-only peer" /></FormControl>
                              <Label className="flex h-full items-center justify-center p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-primary/5 capitalize transition-colors">
                                {source}
                              </Label>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {source !== 'salary' && renderSection(2,
              <div className="space-y-4">
                <Prompt>Estimate cash income ({form.watch('cashPercentage')}%)</Prompt>
                 <p className="text-xs text-muted-foreground -mt-2">Estimate % received as cash/untraced (common for business/mixed; lowers taxable estimate in tool).</p>
                <FormField
                  control={form.control}
                  name="cashPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Slider defaultValue={[field.value]} max={100} step={5} onValueChange={value => field.onChange(value[0])} onValueCommit={() => advanceStep(2)} />
                      </FormControl>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Mostly Digital</span>
                        <span>Mostly Cash</span>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {(step >= 2 && source !== 'salary' || step >=1 && source === 'salary') && renderSection(3, <Button type="submit" disabled={isCalculating} className="w-full md:w-auto !mt-12">
                {isCalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Calculate Impact
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
                    <span className="text-base text-muted-foreground">Before 2026 tax paid ({form.getValues('period')}ly)</span>
                    <span className="text-2xl md:text-3xl font-semibold">{formatCurrency(results.taxBefore / periodDivisor)}</span>
                  </div>
                  <div className="bg-muted h-3 rounded-full">
                    <div className="bg-border h-3 rounded-full" style={{ width: `${beforeTaxWidth}%` }}></div>
                  </div>
                </div>

                {/* After */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-base text-muted-foreground">After 2026 tax paid ({form.getValues('period')}ly)</span>
                    <span className={cn("text-2xl md:text-3xl font-semibold", isIncrease ? "text-destructive" : "text-primary")}>{formatCurrency(results.taxAfter / periodDivisor)}</span>
                  </div>
                  <div className="bg-muted h-3 rounded-full">
                    <div className={cn("h-3 rounded-full", isIncrease ? "bg-destructive" : "bg-primary")} style={{ width: `${afterTaxWidth}%` }}></div>
                  </div>
                </div>
              </div>
              
              {/* Difference */}
              <div className={cn("text-center space-y-2 rounded-lg p-4", isIncrease ? "bg-increase-background" : "bg-saving-background")}>
                  <p className="text-base text-muted-foreground">Difference</p>
                  <div className="flex items-center justify-center gap-4">
                      <p className={cn("text-4xl md:text-5xl font-bold tracking-tight", isIncrease ? "text-destructive" : "text-primary")}>
                          {isIncrease ? '+' : '-'}{formatCurrency(absDiffAmount)}
                      </p>
                      <div className={cn("flex items-center text-xl md:text-2xl font-medium", isIncrease ? "text-destructive" : "text-primary")}>
                        {isIncrease ? <ArrowUp size={28}/> : <ArrowDown size={28}/>}
                        <span>{Math.abs(percentageChange).toFixed(0)}%</span>
                      </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                      (You pay {formatCurrency(absDiffAmount)} {isIncrease ? 'more' : 'less'})
                  </p>
              </div>

              {/* Explanation */}
              <div className="space-y-4">
                <Prompt>Why the change?</Prompt>
                <ul className="space-y-3 text-muted-foreground/90 pl-6">
                    <li className="flex items-start">
                        <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                        <span>Your annual income benefits from the new higher tax-free threshold (₦800,000).</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                        <span>
                            {form.getValues('source') === 'salary'
                            ? 'As a salaried earner, your income is fully assessed under the new structure, but with revised tax bands.'
                            : `For business/mixed income, our model considers that the cash portion (${form.getValues('cashPercentage')}%) may influence your final taxable amount differently under the new system.`}
                        </span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/70"></span>
                        <span>The old system of reliefs combined with rates from 7-24% is being replaced by new progressive bands that change your overall tax.</span>
                    </li>
                </ul>
                <div className="text-xs text-muted-foreground pt-4">
                  <p><strong>Assumptions:</strong> Simplified federal model; cash income lowers estimated taxable portion for business/mixed; excludes personal deductions, state taxes, VAT.</p>
                </div>
              </div>

              <div className="text-center pt-8">
                <Button type="button" variant="outline" size="lg" onClick={() => console.log("Get detailed breakdown clicked")}>
                  Get detailed breakdown (₦500)
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Includes full breakdown, assumptions used, and simple insights.</p>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
