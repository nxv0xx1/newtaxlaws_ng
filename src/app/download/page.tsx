"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Download, AlertCircle } from 'lucide-react';
import { TaxInput, TaxCalculationResult } from '@/lib/tax-calculator';

interface ReportData {
    formData: TaxInput;
    newTaxResults: TaxCalculationResult;
    oldTaxResults: TaxCalculationResult;
}

function DownloadPageContent() {
    const searchParams = useSearchParams();
    const [reference, setReference] = useState<string | null>(null);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (!ref) {
            setError("Payment reference is missing. Please try the payment process again.");
            return;
        }
        setReference(ref);

        try {
            const data = sessionStorage.getItem('reportData');
            if (!data) {
                setError("Report data not found. Please recalculate and complete payment again.");
                return;
            }
            setReportData(JSON.parse(data));
        } catch (e) {
            console.error("Failed to parse report data from session storage", e);
            setError("There was an error retrieving your report data.");
        }
    }, [searchParams]);

    const handleDownload = async () => {
        if (!reference || !reportData) {
            setError("Cannot download report. Missing reference or data.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/download-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reference, reportData }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to generate report. Status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Your-2026-Tax-Report.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (err: any) {
            console.error("Download error:", err);
            setError(err.message || "An unknown error occurred during download.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen font-body bg-background text-foreground flex items-center justify-center">
            <div className="container mx-auto max-w-md px-4 py-16 text-center">
                <h1 className="text-4xl font-bold text-black tracking-tight">
                    Your Report is Ready
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Thank you for your payment. You can now download your personalized tax report.
                </p>

                <div className="mt-12">
                    {error ? (
                        <div className="text-red-500 bg-red-50 p-4 rounded-md flex items-center justify-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                    ) : (
                        <Button
                            size="lg"
                            onClick={handleDownload}
                            disabled={isLoading || !reportData}
                            className="w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-5 w-5" />
                                    Download My Report
                                </>
                            )}
                        </Button>
                    )}
                </div>
                 <p className="text-xs text-muted-foreground/80 mt-8">
                    If you have any issues, please contact{' '}
                    <a href="mailto:feedback@newtaxlaws.ng" className="underline hover:text-primary">
                        feedback@newtaxlaws.ng
                    </a> with your payment reference: <br/> <code className="bg-muted px-1 py-0.5 rounded">{reference}</code>.
                 </p>
            </div>
        </main>
    );
}

export default function DownloadPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DownloadPageContent />
        </Suspense>
    );
}
