"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowRight, Lock, Check, Banknote, Building2, Wallet } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { calculateTaxes, calculateOldTaxes, TaxCalculationResult } from "@/lib/tax-calculator";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  income: z.coerce.number().min(1, { message: "Please enter your income." }),
  period: z.enum(["monthly", "annually"]),
  source: z.enum(["salary", "business", "mixed"]),
  cashPercentage: z.number().min(0).max(100),
  businessIncomePercentage: z.number().min(0).max(100),
  email: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  onClose: () => void;
  callback: (response: { reference: string }) => void;
}

declare global {
  interface Window {
    PaystackPop: {
      setup(options: PaystackOptions): {
        openIframe(): void;
      };
    };
  }
}

export function TaxClarityForm() {
  const [isClient, setIsClient] = useState(false);
  const [results, setResults] = useState<TaxCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      income: undefined,
      period: "monthly",
      source: "salary",
      cashPercentage: 0,
      businessIncomePercentage: 50,
      email: "",
    },
    mode: "onChange",
  });

  const source = form.watch("source");
  const period = form.watch("period");

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
      if (form.getValues('businessIncomePercentage') === 0 || form.getValues('businessIncomePercentage') === 100) {
        form.setValue('businessIncomePercentage', 50);
      }
      if (form.getValues('cashPercentage') === 0) {
        form.setValue('cashPercentage', 40);
      }
    }
  }, [source, form]);


  const calculateAndShowResults = async (data: FormData) => {
    setIsCalculating(true);
    setResults(null);

    // Simulate calculation delay for effect
    await new Promise(resolve => setTimeout(resolve, 800));

    const taxResult = calculateTaxes(data);
    setResults(taxResult);
    setIsCalculating(false);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const onManualSubmit = (data: FormData) => {
    calculateAndShowResults(data);
  }

  const handlePayment = () => {
    const emailForReport = form.getValues('email');

    if (!emailForReport || !/^\S+@\S+\.\S+$/.test(emailForReport)) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email to receive the report.",
      });
      return;
    }

    setIsPaying(true);

    if (!results) {
      toast({ variant: "destructive", title: "Error", description: "Calculation data is missing." });
      setIsPaying(false);
      return;
    }

    const formData = form.getValues();
    const oldTaxResults = calculateOldTaxes(formData);
    const reportData = { formData, newTaxResults: results, oldTaxResults };

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_live_a57cfe506f43c31aa18c093b3bec333c74d4ec78',
      email: emailForReport,
      amount: 20000, // ₦200 in kobo
      callback: (response: { reference: string }) => {
        try {
          sessionStorage.setItem('reportData', JSON.stringify(reportData));
          router.push(`/report?ref=${response.reference}`);
        } catch (e) {
          console.error("Error", e);
          toast({ variant: "destructive", title: "Error", description: "Failed to prepare report." });
          setIsPaying(false);
        }
      },
      onClose: () => {
        setIsPaying(false);
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

  const periodDivisor = period === 'monthly' ? 12 : 1;

  if (!isClient) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-emerald-900 text-white p-8 text-center space-y-2">
          <CardTitle className="font-serif text-2xl md:text-3xl">Tax Calculator</CardTitle>
          <CardDescription className="text-emerald-100/80 text-base">
            Instant 2026 estimate based on official rules.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 md:p-8 space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onManualSubmit)} className="space-y-8">

              {/* Income Input */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-emerald-900">Annual or Monthly Income</Label>
                <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 items-start">
                  <FormField
                    control={form.control}
                    name="income"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₦</span>
                            <Input
                              type="number"
                              placeholder="e.g. 5,000,000"
                              className="h-14 pl-10 text-lg bg-white border-emerald-100 focus-visible:ring-emerald-500"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                              value={field.value ?? ""}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem className="flex bg-muted p-1 rounded-lg h-14 items-center">
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-0">
                            <FormItem className="space-y-0">
                              <FormControl>
                                <RadioGroupItem value="monthly" className="sr-only peer" />
                              </FormControl>
                              <Label className="px-4 py-2.5 rounded-md cursor-pointer text-sm font-medium transition-all peer-data-[state=checked]:bg-white peer-data-[state=checked]:shadow-sm peer-data-[state=checked]:text-emerald-900 text-muted-foreground">
                                Monthly
                              </Label>
                            </FormItem>
                            <FormItem className="space-y-0">
                              <FormControl>
                                <RadioGroupItem value="annually" className="sr-only peer" />
                              </FormControl>
                              <Label className="px-4 py-2.5 rounded-md cursor-pointer text-sm font-medium transition-all peer-data-[state=checked]:bg-white peer-data-[state=checked]:shadow-sm peer-data-[state=checked]:text-emerald-900 text-muted-foreground">
                                Yearly
                              </Label>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Source Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-emerald-900">Income Source</Label>
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
                          {[
                            { id: "salary", label: "Salary Only", icon: Wallet },
                            { id: "business", label: "Business", icon: Building2 },
                            { id: "mixed", label: "Mixture", icon: Banknote },
                          ].map((item) => (
                            <div key={item.id}>
                              <RadioGroupItem value={item.id} id={`source-${item.id}`} className="sr-only peer" />
                              <Label
                                htmlFor={`source-${item.id}`}
                                className="flex flex-col items-center justify-center gap-2 h-24 p-2 border-2 border-muted bg-white rounded-xl cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/50 transition-all peer-data-[state=checked]:border-emerald-600 peer-data-[state=checked]:bg-emerald-50 peer-data-[state=checked]:text-emerald-900"
                              >
                                <item.icon className="h-6 w-6 opacity-70" />
                                <span className="font-medium">{item.label}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Dynamic Sliders */}
              {source !== 'salary' && (
                <div className="p-4 bg-muted/30 rounded-xl space-y-6 border border-border/50 animate-fade-in-up">
                  {source === 'mixed' && (
                    <FormField
                      control={form.control}
                      name="businessIncomePercentage"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between mb-2">
                            <Label>Calculated Split</Label>
                            <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border">{field.value}% Business</span>
                          </div>
                          <FormControl>
                            <Slider
                              value={[field.value || 50]}
                              max={100}
                              step={5}
                              onValueChange={value => field.onChange(value[0])}
                              className="py-2"
                            />
                          </FormControl>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Salary</span>
                            <span>Business</span>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="cashPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between mb-2">
                          <Label>Cash estimate for business</Label>
                          <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border">{field.value}% Cash</span>
                        </div>
                        <FormControl>
                          <Slider
                            value={[field.value]}
                            max={100}
                            step={5}
                            onValueChange={value => field.onChange(value[0])}
                            className="py-2"
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Digital</span>
                          <span>Cash</span>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-heading tracking-wide"
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  "Calculate Estimates"
                )}
              </Button>
            </form>
          </Form>

          {/* Application Results */}
          {results && !isCalculating && (
            <div ref={resultsRef} className="animate-fade-in-up space-y-6 pt-8 border-t border-dashed">

              {/* Free Result: Total Tax */}
              <div className="text-center space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Total Estimated Tax</h3>
                <div className="text-5xl md:text-6xl font-serif font-bold text-emerald-900 tracking-tight">
                  {formatCurrency(results.totalTax / periodDivisor)}
                  <span className="text-lg text-muted-foreground font-sans font-normal ml-1">
                    /{period === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                <p className="text-sm text-green-600 font-medium flex items-center justify-center gap-1">
                  <Check className="h-4 w-4" />
                  Use this figure for your planning
                </p>
              </div>

              {/* Locked Detailed Section */}
              <div className="relative rounded-xl border border-border overflow-hidden cursor-not-allowed group">

                {/* Blurry Content */}
                <div className="p-6 bg-muted/20 text-muted-foreground filter blur-[5px] select-none pointer-events-none opacity-60">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-lg">
                      <span>Net Take Home</span>
                      <span className="font-bold">₦250,000</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span>Effective Rate</span>
                      <span className="font-bold">12.5%</span>
                    </div>
                    <div className="h-px bg-border my-4" />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Exempt Income</span>
                        <span>₦800,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Band 1 (15%)</span>
                        <span>₦45,000</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unlock Overlay */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 mb-4 shadow-sm">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-emerald-950 mb-2">Unlock Full Breakdown</h4>
                  <p className="text-muted-foreground mb-6 max-w-xs text-sm">
                    Get your Net Income, Effective Rate, and a downloadable PDF report for your records.
                  </p>

                  <div className="w-full max-w-xs space-y-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              className="bg-white"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      onClick={handlePayment}
                      disabled={isPaying}
                      className="w-full bg-emerald-800 hover:bg-emerald-900 text-white shadow-lg shadow-emerald-900/10"
                    >
                      {isPaying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Unlock full report — ₦200
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}