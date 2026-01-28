"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { verifyPaystackTransaction } from '@/app/actions/payment';
import { TaxInput, TaxCalculationResult } from '@/lib/tax-calculator';
import { TaxReport } from '@/components/tax-app/tax-report';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportData {
    formData: TaxInput;
    newTaxResults: TaxCalculationResult;
}

function ReportPageContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'verifying' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);
    const [reportData, setReportData] = useState<ReportData | null>(null);

    useEffect(() => {
        const verify = async () => {
            const ref = searchParams.get('ref');
            if (!ref) {
                setError("Payment reference is missing. Please try the payment process again.");
                setStatus('error');
                return;
            }

            let data;
            try {
                data = sessionStorage.getItem('reportData');
                if (!data) {
                    setError("Report data not found. Please recalculate and complete payment again.");
                    setStatus('error');
                    return;
                }
                setReportData(JSON.parse(data));
            } catch (e) {
                console.error("Failed to parse report data from session storage", e);
                setError("There was an error retrieving your report data.");
                setStatus('error');
                return;
            }
            
            setStatus('verifying');

            if (ref !== 'ADMIN_SKIP_PAYMENT') {
                const verificationResult = await verifyPaystackTransaction(ref);
                if (verificationResult.status !== 'success') {
                    setError(verificationResult.message || 'Payment verification failed. Please contact support.');
                    setStatus('error');
                    return;
                }
                if ((verificationResult.data?.amount ?? 0) < 500) {
                    setError('Incorrect payment amount recorded. Please contact support.');
                    setStatus('error');
                    return;
                }
            }

            setStatus('success');
        };

        verify();
    }, [searchParams]);

    if (status === 'loading') {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-16">
                <Skeleton className="h-10 w-1/2 mx-auto mb-4" />
                <Skeleton className="h-6 w-1/3 mx-auto mb-12" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }
    
    if (status === 'verifying') {
        return (
            <div className="container mx-auto max-w-md px-4 py-16 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                <h1 className="text-2xl font-bold text-black tracking-tight">
                    Verifying your payment...
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Please wait a moment while we securely confirm your transaction.
                </p>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="container mx-auto max-w-md px-4 py-16 text-center">
                <div className="text-red-500 bg-red-50 p-6 rounded-lg flex flex-col items-center justify-center gap-4">
                    <AlertCircle className="h-10 w-10" />
                    <h2 className="text-xl font-bold">Verification Failed</h2>
                    <span className="text-sm">{error}</span>
                     <Button variant="outline" onClick={() => window.location.href = '/'}>Go back to Calculator</Button>
                </div>
                <p className="text-xs text-muted-foreground/80 mt-8">
                    If you have any issues, please contact{' '}
                    <a href="mailto:feedback@newtaxlaws.ng" className="underline hover:text-primary">
                        feedback@newtaxlaws.ng
                    </a>.
                 </p>
            </div>
        )
    }

    if (status === 'success' && reportData) {
        return <TaxReport data={reportData} />;
    }

    return null;
}

export default function ReportPage() {
    return (
        <main className="min-h-screen font-body bg-gray-50 text-foreground">
            <Suspense fallback={<div>Loading report...</div>}>
                <ReportPageContent />
            </Suspense>
        </main>
    );
}
