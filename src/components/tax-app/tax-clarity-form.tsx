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
import { explainTaxChanges } from "@/ai/flows/explain-tax-changes";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  income: z.coerce.number().min(1, { message: "Please enter your income." }),
  period: z.enum(["monthly", "annually"]),
  source: z.enum(["salary", "business", "mixed"]),
  cashPercentage: z.number().min(0).max(100),
});

type FormData = z.infer<typeof formSchema>;

const Prompt = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 text-foreground">
    <span className="text-primary">{">"}</span>
    <span className="font-medium">{children}</span>
  </div>
);

const BlinkingCursor = () => (
  <span className="inline-block h-4 w-2 ml-1 animate-blinking-cursor" />
);

export function TaxClarityForm() {
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<{ taxBefore: number; taxAfter: number } | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
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

  const onSubmit = async (data: FormData) => {
      setIsCalculating(true);
      setCalculationFeedback([]);
      setResults(null);
      setExplanation(null);

      const feedbacks = [
        "applying pre-2026 tax rules...",
        "applying new tax laws...",
        "comparing outcomes...",
        "generating explanation...",
      ];
      
      for (let i = 0; i < feedbacks.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setCalculationFeedback(prev => [...prev, feedbacks[i]]);
      }

      const { taxBefore, taxAfter } = calculateTaxes(data);
      
      try {
        const aiResponse = await explainTaxChanges({
          incomeType: data.source,
          incomeBefore: data.period === 'monthly' ? (data.income || 0) * 12 : (data.income || 0),
          incomeAfter: data.period === 'monthly' ? (data.income || 0) * 12 : (data.income || 0),
          taxBefore,
          taxAfter,
          cashPercentage: data.cashPercentage,
        });
        setExplanation(aiResponse.explanation);
      } catch (error) {
        console.error("AI explanation failed:", error);
        setExplanation("There was an issue generating a personalized explanation. The change is primarily due to new tax brackets and adjustments to deductible allowances.");
      }
      
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
                            <Input type="number" placeholder="e.g. 150000" className="text-base" {...field} onBlur={handleIncomeBlur} />
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
              </div>
            )}

            {renderSection(1, 
              <div className="space-y-4">
                <Prompt>Select income source</Prompt>
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup onValueChange={(v) => handleRadioChange(field, v, 1)} defaultValue={field.value} className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

            {renderSection(2,
              <div className="space-y-4">
                <Prompt>Estimate cash income ({form.watch('cashPercentage')}%)</Prompt>
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
            
            {renderSection(3, <Button type="submit" disabled={isCalculating} className="w-full md:w-auto !mt-12">
                {isCalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Calculate Impact
            </Button>
            )}
          </div>

          {(isCalculating || (results && explanation)) && (
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

          {results && explanation && !isCalculating && (
            <div className="space-y-12 !mt-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                <div>
                  <p className="text-sm text-muted-foreground">Before 2026</p>
                  <p className="text-3xl md:text-4xl font-semibold tracking-tight">{formatCurrency(results.taxBefore / periodDivisor)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">After 2026</p>
                  <p className="text-3xl md:text-4xl font-semibold tracking-tight">{formatCurrency(results.taxAfter / periodDivisor)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Difference</p>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <p className={cn("text-3xl md:text-4xl font-semibold tracking-tight", isIncrease ? "text-destructive" : "text-green-600")}>
                      {formatCurrency(Math.abs(difference) / periodDivisor)}
                    </p>
                    <span className={cn("flex items-center text-lg font-medium", isIncrease ? "text-destructive" : "text-green-600")}>
                      {isIncrease ? <ArrowUp size={20}/> : <ArrowDown size={20}/>}
                      {Math.abs(percentageChange).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Prompt>Why the change?</Prompt>
                <p className="leading-relaxed">{explanation}</p>
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
