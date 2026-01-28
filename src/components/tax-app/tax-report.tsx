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
    const colors = ["#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e"];
    if (result.taxableIncome <= 0) return <div className="text-muted-foreground">Taxable income is zero or less.</div>;
    return (
        <>
            <div className="w-full flex h-4 rounded overflow-hidden bg-gray-200 text-xs text-white">
                {result.breakdown.map((item, index) => {
                    if (item.taxable <= 0) return '';
                    const widthPercent = (item.taxable / result.taxableIncome) * 100;
                    return <div key={index} style={{ width: `${widthPercent}%`, backgroundColor: colors[index % colors.length] }} className="flex items-center justify-center" title={`${item.bandDescription}: ${formatCurrency(item.taxable)} @ ${item.rate*100}%`}>{widthPercent > 10 ? `${Math.round(widthPercent)}%` : ''}</div>
                })}
            </div>
            <div className="w-full flex justify-between text-xs mt-1">
                <span>₦0</span>
                <span>{formatCurrency(result.taxableIncome)}</span>
            </div>
        </>
    );
};

export function TaxReport({ data }: TaxReportProps) {
  const { formData, newTaxResults, oldTaxResults } = data;

  const savings = oldTaxResults.totalTax - newTaxResults.totalTax;
  const savingsPercentage = oldTaxResults.totalTax > 0 ? (savings / oldTaxResults.totalTax) * 100 : (newTaxResults.totalTax > 0 ? -100 : 0);
  const savingsClass = savings >= 0 ? 'text-green-600' : 'text-red-600';
  const savingsText = savings >= 0 ? 'Savings' : 'Increase';
  
  const handlePrint = () => {
    window.print();
  };

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
            <h1 className="text-4xl font-bold text-gray-800">Personalized Tax Report</h1>
            <p className="text-gray-500 mt-2">Comparison of Pre-2026 vs. 2026 Tax Rules</p>
        </header>

        <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4">Your Income Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                <div><strong>Total Gross Income:</strong> {formatCurrency(formData.income)} / {formData.period}</div>
                <div><strong>Annual Gross Income:</strong> {formatCurrency(newTaxResults.annualIncome)}</div>
                <div><strong>Income Source:</strong> <span className="capitalize">{formData.source}</span></div>
                {formData.source !== 'salary' && <div><strong>Cash Income Estimate:</strong> {formData.cashPercentage}%</div>}
                {formData.source === 'mixed' && <div><strong>Business Income Split:</strong> {formData.businessIncomePercentage}%</div>}
            </div>
        </section>

        <section className="mb-8">
             <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4">Summary of Changes</h2>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-500">Old Tax (Pre-2026)</div>
                    <div className="text-3xl font-bold text-gray-800 mt-1">{formatCurrency(oldTaxResults.totalTax)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-500">New Tax (2026 Rules)</div>
                    <div className="text-3xl font-bold text-gray-800 mt-1">{formatCurrency(newTaxResults.totalTax)}</div>
                </div>
                <div className={cn('p-4 rounded-lg', savings >= 0 ? 'bg-green-50' : 'bg-red-50')}>
                    <div className={cn('font-semibold', savingsClass)}>Annual {savingsText}</div>
                    <div className={cn('text-3xl font-bold mt-1', savingsClass)}>{formatCurrency(Math.abs(savings))}</div>
                    <div className={cn('text-sm mt-1', savingsClass)}>({savingsPercentage.toFixed(1)}%)</div>
                </div>
             </div>
        </section>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <section>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">Pre-2026 Tax Calculation</h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                     <p><strong>Annual Gross Income:</strong> {formatCurrency(oldTaxResults.annualIncome)}</p>
                     <p><strong>Taxable Income:</strong> <span className="font-mono">{formatCurrency(oldTaxResults.taxableIncome)}</span></p>
                     <p className="text-xs text-gray-500">(After Consolidated Relief Allowance)</p>
                     <hr className="my-3"/>
                     <p><strong>Total Annual Tax:</strong> <span className="font-bold text-xl">{formatCurrency(oldTaxResults.totalTax)}</span></p>
                     <p><strong>Take-Home Pay:</strong> <span className="font-bold text-xl text-blue-600">{formatCurrency(oldTaxResults.netIncome)}</span></p>
                </div>
            </section>
            
            <section>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">2026 Tax Calculation</h3>
                <div className="bg-green-50 p-4 rounded-md space-y-2">
                     <p><strong>Annual Gross Income:</strong> {formatCurrency(newTaxResults.annualIncome)}</p>
                     <p><strong>Taxable Income:</strong> <span className="font-mono">{formatCurrency(newTaxResults.taxableIncome)}</span></p>
                     <p className="text-xs text-gray-500">(After business/cash assumptions)</p>
                     <hr className="my-3"/>
                     <p><strong>Total Annual Tax:</strong> <span className="font-bold text-xl">{formatCurrency(newTaxResults.totalTax)}</span></p>
                     <p><strong>Take-Home Pay:</strong> <span className="font-bold text-xl text-green-700">{formatCurrency(newTaxResults.netIncome)}</span></p>
                </div>
            </section>
        </div>
        
        <section className="mt-8">
             <h3 className="text-xl font-semibold text-gray-700 mb-3">2026 Taxable Income Bands</h3>
             {renderBandChart(newTaxResults)}
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


        <footer className="mt-12 pt-6 border-t text-xs text-gray-500">
            <h4 className="font-semibold text-sm text-gray-600 mb-2">Assumptions & Disclaimer</h4>
            <ul className="list-disc list-inside space-y-1 mb-4">
                <li>Calculations are estimates based on the federal Personal Income Tax Act (PITA) for 2026.</li>
                <li>State-level taxes, levies, or other specific deductions are not included.</li>
                <li>Personal reliefs beyond the primary tax-free threshold are not included.</li>
                <li>For business/mixed income, taxable income is estimated based on the cash percentage provided. This is a simplification.</li>
                <li>This report is for informational purposes only and does not constitute financial or tax advice. Please consult with a qualified professional for advice tailored to your specific situation.</li>
            </ul>
            <p className="text-center mt-6">&copy; 2026 newtaxlaws_ng. All rights reserved.</p>
        </footer>
    </div>
  );
}
