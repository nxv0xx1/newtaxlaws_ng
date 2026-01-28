'use server';

import { z } from 'zod';

const verifyPaymentSchema = z.object({
  reference: z.string().min(1, 'Reference is required'),
});

export async function verifyPaystackTransaction(reference: string) {
  try {
    verifyPaymentSchema.parse({ reference });
  } catch (error) {
    return { status: 'error', message: 'Invalid payment reference provided.' };
  }
  
  if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error('Paystack secret key is not configured.');
      return { status: 'error', message: 'Payment gateway is not configured. Please contact support.' };
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (data.status && data.data.status === 'success') {
      return {
        status: 'success',
        message: 'Payment verified successfully.',
        data: {
            email: data.data.customer.email,
            amount: data.data.amount / 100,
            reference: data.data.reference
        }
      };
    } else {
      return { status: 'error', message: data.message || 'Payment verification failed.' };
    }
  } catch (error) {
    console.error('Paystack verification error:', error);
    return { status: 'error', message: 'An unexpected error occurred during payment verification.' };
  }
}
