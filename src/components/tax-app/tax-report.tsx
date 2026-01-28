"use client";

import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TaxInput, TaxCalculationResult } from '@/lib/tax-calculator';
import { cn } from '@/lib/utils';

interface TaxReportProps {
  data: {
    formData: TaxInput;
    newTaxResults: TaxCalculationResult;
    oldTaxResults: TaxCalculationResult;
  };
}

const formatCurrency = (amount: number) => {
    return `₦${new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
};

const renderBreakdown = (breakdown: TaxCalculationResult['breakdown']) => breakdown.map((item, index) => (
    <tr className="border-b" key={index}>
        <td className="py-2 pr-4">{item.bandDescription}</td>
        <td className="py-2 pr-4 text-right">{(item.rate * 100).toFixed(0)}%</td>
        <td className="py-2 text-right">{formatCurrency(item.tax)}</td>
    </tr>
));

const renderBandChart = (result: TaxCalculationResult) => {
    const colors = ["#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a"];
    if (result.taxableIncome <= 0) return <div className='text-sm text-muted-foreground'>Taxable income is zero or less.</div>;
    return (
        <div className="w-full flex h-4 rounded-full overflow-hidden bg-gray-200 text-xs text-white">
            {result.breakdown.map((item, index) => {
                if (item.taxable <= 0) return null;
                const widthPercent = (item.taxable / result.taxableIncome) * 100;
                return (
                    <div
                        key={index}
                        style={{ width: `${widthPercent}%`, backgroundColor: colors[index % colors.length] }}
                        className="flex items-center justify-center"
                        title={`${item.bandDescription}: ${formatCurrency(item.taxable)} @ ${item.rate*100}%`}
                    >
                      {widthPercent > 10 ? `${Math.round(widthPercent)}%` : ''}
                    </div>
                );
            })}
        </div>
    );
};

const getInsight = (newTaxResults: TaxCalculationResult, formData: TaxInput) => {
    if (newTaxResults.effectiveRate < 5) {
      return "Your effective tax rate is very low. The new laws benefit you significantly by increasing the tax-free threshold.";
    }
    if (formData.source === 'business' || formData.source === 'mixed') {
      return `As a business owner, ensure you're keeping detailed records. You can deduct legitimate business expenses to lower your taxable income.`;
    }
    const highestBracket = Math.max(...newTaxResults.breakdown.map(b => b.rate));
    if (highestBracket >= 0.15) {
      return `Your highest tax bracket is ${highestBracket * 100}%. Consider maximizing legal deductions like rent (up to ₦500k/year) if applicable.`;
    }
    return "This report gives you a clear picture of your tax situation under the new 2026 laws. For personalized advice, consult a tax professional.";
};


export function TaxReport({ data }: TaxReportProps) {
  const { formData, newTaxResults, oldTaxResults } = data;
  
  const handlePrint = () => {
    window.print();
  };

  const savings = oldTaxResults.totalTax - newTaxResults.totalTax;
  const savingsPercentage = oldTaxResults.totalTax > 0 ? (savings / oldTaxResults.totalTax) * 100 : 0;
  const savingsClass = savings > 0 ? 'text-green-700' : 'text-red-700';
  const savingsText = savings > 0 ? 'Savings' : 'Increase';
  const savingsBgClass = savings > 0 ? 'bg-green-50' : 'bg-red-50';

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 sm:p-10 my-8 rounded-lg shadow-lg print:shadow-none print:my-0">
        <div className="flex justify-between items-start mb-8 print:hidden">
            <Link href="/" passHref>
                <Button variant="ghost">
                    <ArrowLeft className="mr-2" />
                    Back to Calculator
                </Button>
            </Link>
            <Button onClick={handlePrint}>
                <Printer className="mr-2" />
                Print Report
            </Button>
        </div>

        <header className="text-center border-b pb-4 mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Your 2026 Personal Tax Report</h1>
            <p className="text-gray-500 mt-2">An estimate based on the new 2026 Personal Income Tax Act.</p>
        </header>

        <section className="mb-8 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                <div><strong>Annual Income:</strong> {formatCurrency(newTaxResults.annualIncome)}</div>
                <div><strong>Income Type:</strong> <span className="capitalize">{formData.source}</span></div>
                {formData.source !== 'salary' && <div><strong>Cash Estimate:</strong> {formData.cashPercentage}%</div>}
            </div>
        </section>

        <section className={cn("mb-10 p-6 rounded-lg", savingsBgClass)}>
             <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tax Comparison: Before vs. After 2026</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                    <div className="text-gray-600">Old Annual Tax</div>
                    <div className="text-3xl font-bold text-gray-800 mt-1">{formatCurrency(oldTaxResults.totalTax)}</div>
                </div>
                <div>
                    <div className="text-gray-600">New Annual Tax (2026)</div>
                    <div className="text-3xl font-bold text-gray-800 mt-1">{formatCurrency(newTaxResults.totalTax)}</div>
                </div>
                <div>
                    <div className={cn("font-medium", savingsClass)}>Your Annual {savingsText}</div>
                    <div className={cn("text-3xl font-bold mt-1", savingsClass)}>{formatCurrency(Math.abs(savings))}</div>
                    <div className={cn("text-sm", savingsClass)}>({savingsPercentage.toFixed(1)}%)</div>
                </div>
             </div>
        </section>

        <section className="mb-10">
             <h3 className="text-xl font-semibold text-gray-700 mb-3">Visualizing Your 2026 Taxable Income</h3>
             <p className="text-sm text-muted-foreground mb-2">Each block represents a portion of your income and how it's taxed.</p>
             {renderBandChart(newTaxResults)}
             <div className="w-full flex justify-between text-xs mt-1 px-1">
                <span>₦0</span>
                <span>{formatCurrency(newTaxResults.taxableIncome)}</span>
            </div>
        </section>
        
        <section className="mb-10">
             <h3 className="text-xl font-semibold text-gray-700 mb-3">Detailed 2026 Tax Breakdown</h3>
             <table className="w-full mt-4 text-left text-sm">
                <thead>
                    <tr className="border-b-2">
                        <th className="py-2 font-semibold">Band Description</th>
                        <th className="py-2 font-semibold text-right">Rate</th>
                        <th className="py-2 font-semibold text-right">Tax Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {renderBreakdown(newTaxResults.breakdown)}
                    <tr className="border-t-2 font-bold">
                        <td className="py-2" colSpan={2}>Total Annual Tax</td>
                        <td className="py-2 text-right">{formatCurrency(newTaxResults.totalTax)}</td>
                    </tr>
                </tbody>
             </table>
        </section>

         <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Take-Home Pay Summary (2026)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-md">
                    <p className="text-gray-600">Average Monthly Take-Home</p>
                    <p className="font-bold text-2xl text-green-700">{formatCurrency(newTaxResults.netIncome / 12)}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-md">
                    <p className="text-gray-600">Total Annual Take-Home</p>
                    <p className="font-bold text-2xl text-green-800">{formatCurrency(newTaxResults.netIncome)}</p>
                </div>
            </div>
        </section>
        
        <section className="mb-10 bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Key Insight</h3>
            <p className="text-gray-800">{getInsight(newTaxResults, formData)}</p>
        </section>

        <footer className="mt-12 pt-6 border-t text-xs text-gray-500">
            <h4 className="font-semibold text-sm text-gray-600 mb-2">Assumptions & Disclaimer</h4>
            <ul className="list-disc list-inside space-y-1 mb-4">
                <li>Calculations are estimates based on the federal Personal Income Tax Act (PITA) for 2026.</li>
                <li>The "Before 2026" calculation uses simplified 2024 rules with a Consolidated Relief Allowance for comparison.</li>
                <li>State-level taxes, levies, or other specific deductions are not included.</li>
                <li>For business/mixed income, taxable income is estimated based on the cash percentage provided. This is a simplification.</li>
                <li>This report is for informational purposes only and does not constitute financial or tax advice. Please consult with a qualified professional for advice tailored to your specific situation.</li>
            </ul>
            <div className="mt-8 text-center print:hidden">
                 <Button onClick={handlePrint} size="lg">
                    <Printer className="mr-2" />
                    Print Report
                </Button>
            </div>
            <p className="text-center mt-6">&copy; 2026 newtaxlaws_ng. All rights reserved.</p>
        </footer>
    </div>
  );
}
