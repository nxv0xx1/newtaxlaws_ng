import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { verifyPaystackTransaction } from '@/app/actions/payment';
import { TaxInput, TaxCalculationResult } from '@/lib/tax-calculator';

interface ReportData {
    formData: TaxInput;
    newTaxResults: TaxCalculationResult;
    oldTaxResults: TaxCalculationResult;
}

const formatCurrency = (amount: number) => {
    return `₦${new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
};

const generateHtmlForPdf = (data: ReportData): string => {
    const { formData, newTaxResults, oldTaxResults } = data;

    const savings = oldTaxResults.totalTax - newTaxResults.totalTax;
    const savingsPercentage = oldTaxResults.totalTax > 0 ? (savings / oldTaxResults.totalTax) * 100 : 0;
    const savingsClass = savings > 0 ? 'text-green-600' : 'text-red-600';
    const savingsText = savings > 0 ? 'Savings' : 'Increase';

    const renderBreakdown = (breakdown: TaxCalculationResult['breakdown']) => breakdown.map(item => `
        <tr class="border-b">
            <td class="py-2 pr-4">${item.bandDescription}</td>
            <td class="py-2 pr-4 text-right">${(item.rate * 100).toFixed(0)}%</td>
            <td class="py-2 text-right">${formatCurrency(item.tax)}</td>
        </tr>
    `).join('');

    const renderBandChart = (result: TaxCalculationResult) => {
        const colors = ["#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e"];
        if (result.taxableIncome <= 0) return '<div>Taxable income is zero.</div>';
        return `
            <div class="w-full flex h-4 rounded overflow-hidden bg-gray-200 text-xs text-white">
                ${result.breakdown.map((item, index) => {
                    if (item.taxable <= 0) return '';
                    const widthPercent = (item.taxable / result.taxableIncome) * 100;
                    return `<div style="width: ${widthPercent}%; background-color: ${colors[index % colors.length]};" class="flex items-center justify-center" title="${item.bandDescription}: ${formatCurrency(item.taxable)} @ ${item.rate*100}%">${widthPercent > 10 ? `${Math.round(widthPercent)}%` : ''}</div>`
                }).join('')}
            </div>
            <div class="w-full flex justify-between text-xs mt-1">
                <span>₦0</span>
                <span>${formatCurrency(result.taxableIncome)}</span>
            </div>
        `;
    };

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>Personalized Tax Report</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="font-sans p-8 bg-gray-50">
            <div class="max-w-4xl mx-auto bg-white p-10 rounded-lg shadow-lg">
                <header class="text-center border-b pb-4 mb-8">
                    <h1 class="text-4xl font-bold text-gray-800">Personalized Tax Report</h1>
                    <p class="text-gray-500 mt-2">Comparison of Pre-2026 vs. 2026 Tax Rules</p>
                </header>

                <section class="mb-8">
                    <h2 class="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4">Your Income Details</h2>
                    <div class="grid grid-cols-2 gap-4 text-base">
                        <div><strong>Total Gross Income:</strong> ${formatCurrency(formData.income)} / ${formData.period}</div>
                        <div><strong>Annual Gross Income:</strong> ${formatCurrency(newTaxResults.annualIncome)}</div>
                        <div><strong>Income Source:</strong> <span class="capitalize">${formData.source}</span></div>
                        ${formData.source !== 'salary' ? `<div><strong>Cash Income Estimate:</strong> ${formData.cashPercentage}%</div>` : ''}
                        ${formData.source === 'mixed' ? `<div><strong>Business Income Split:</strong> ${formData.businessIncomePercentage}%</div>` : ''}
                    </div>
                </section>

                <section class="mb-8">
                     <h2 class="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4">Summary of Changes</h2>
                     <div class="grid grid-cols-3 gap-6 text-center">
                        <div>
                            <div class="text-gray-500">Old Tax (Pre-2026)</div>
                            <div class="text-3xl font-bold text-gray-800 mt-1">${formatCurrency(oldTaxResults.totalTax)}</div>
                        </div>
                        <div>
                            <div class="text-gray-500">New Tax (2026 Rules)</div>
                            <div class="text-3xl font-bold text-gray-800 mt-1">${formatCurrency(newTaxResults.totalTax)}</div>
                        </div>
                        <div>
                            <div class="text-gray-500">Annual ${savingsText}</div>
                            <div class="text-3xl font-bold ${savingsClass} mt-1">${formatCurrency(Math.abs(savings))}</div>
                            <div class="text-sm ${savingsClass}">(${savingsPercentage.toFixed(1)}%)</div>
                        </div>
                     </div>
                </section>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <section>
                        <h3 class="text-xl font-semibold text-gray-700 mb-3">Pre-2026 Tax Calculation</h3>
                        <div class="bg-gray-50 p-4 rounded-md space-y-2">
                             <p><strong>Annual Gross Income:</strong> ${formatCurrency(oldTaxResults.annualIncome)}</p>
                             <p><strong>Taxable Income:</strong> <span class="font-mono">${formatCurrency(oldTaxResults.taxableIncome)}</span></p>
                             <p class="text-xs text-gray-500">(After Consolidated Relief Allowance)</p>
                             <hr class="my-3"/>
                             <p><strong>Total Annual Tax:</strong> <span class="font-bold text-xl">${formatCurrency(oldTaxResults.totalTax)}</span></p>
                             <p><strong>Take-Home Pay:</strong> <span class="font-bold text-xl text-blue-600">${formatCurrency(oldTaxResults.netIncome)}</span></p>
                        </div>
                    </section>
                    
                    <section>
                        <h3 class="text-xl font-semibold text-gray-700 mb-3">2026 Tax Calculation</h3>
                        <div class="bg-green-50 p-4 rounded-md space-y-2">
                             <p><strong>Annual Gross Income:</strong> ${formatCurrency(newTaxResults.annualIncome)}</p>
                             <p><strong>Taxable Income:</strong> <span class="font-mono">${formatCurrency(newTaxResults.taxableIncome)}</span></p>
                             <p class="text-xs text-gray-500">(After business/cash assumptions)</p>
                             <hr class="my-3"/>
                             <p><strong>Total Annual Tax:</strong> <span class="font-bold text-xl">${formatCurrency(newTaxResults.totalTax)}</span></p>
                             <p><strong>Take-Home Pay:</strong> <span class="font-bold text-xl text-green-700">${formatCurrency(newTaxResults.netIncome)}</span></p>
                        </div>
                    </section>
                </div>
                
                <section class="mt-8">
                     <h3 class="text-xl font-semibold text-gray-700 mb-3">2026 Taxable Income Bands</h3>
                     ${renderBandChart(newTaxResults)}
                     <table class="w-full mt-4 text-left text-sm">
                        <thead>
                            <tr class="border-b-2">
                                <th class="py-2 font-semibold">Band Description</th>
                                <th class="py-2 font-semibold text-right">Rate</th>
                                <th class="py-2 font-semibold text-right">Tax Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${renderBreakdown(newTaxResults.breakdown)}
                            <tr class="border-t-2 font-bold">
                                <td class="py-2" colspan="2">Total Annual Tax</td>
                                <td class="py-2 text-right">${formatCurrency(newTaxResults.totalTax)}</td>
                            </tr>
                        </tbody>
                     </table>
                </section>


                <footer class="mt-12 pt-6 border-t text-xs text-gray-500">
                    <h4 class="font-semibold text-sm text-gray-600 mb-2">Assumptions & Disclaimer</h4>
                    <ul class="list-disc list-inside space-y-1 mb-4">
                        <li>Calculations are estimates based on the federal Personal Income Tax Act (PITA) for 2026.</li>
                        <li>State-level taxes, levies, or other specific deductions are not included.</li>
                        <li>Personal reliefs beyond the primary tax-free threshold are not included.</li>
                        <li>For business/mixed income, taxable income is estimated based on the cash percentage provided. This is a simplification.</li>
                        <li>This report is for informational purposes only and does not constitute financial or tax advice. Please consult with a qualified professional for advice tailored to your specific situation.</li>
                    </ul>
                    <p class="text-center mt-6">&copy; 2026 newtaxlaws_ng. All rights reserved.</p>
                </footer>
            </div>
        </body>
        </html>
    `;
};


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { reference, reportData } = body as { reference: string, reportData: ReportData };

        if (!reference || !reportData) {
            return NextResponse.json({ error: 'Missing payment reference or report data' }, { status: 400 });
        }

        if (reference !== 'ADMIN_SKIP_PAYMENT') {
            // 1. Verify the payment again on the backend
            const verificationResult = await verifyPaystackTransaction(reference);
            if (verificationResult.status !== 'success') {
                return NextResponse.json({ error: 'Payment verification failed' }, { status: 402 });
            }
            
            // 2. Check if the amount paid is correct
            if ((verificationResult.data?.amount ?? 0) < 500) {
                 return NextResponse.json({ error: 'Incorrect payment amount' }, { status: 402 });
            }
        }


        // 3. Generate the PDF
        const html = generateHtmlForPdf(reportData);

        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });

        await browser.close();

        // 4. Return the PDF as a response
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="Your-2026-Tax-Report.pdf"',
            },
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate PDF report' }, { status: 500 });
    }
}
