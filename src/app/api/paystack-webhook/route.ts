'use server';

import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    console.error('Paystack secret key is not configured.');
    return NextResponse.json({ status: 'error', message: 'Server configuration error.' }, { status: 500 });
  }
  
  const body = await req.text();
  const signature = req.headers.get('x-paystack-signature');

  if (!signature) {
    return NextResponse.json({ status: 'error', message: 'Missing signature' }, { status: 400 });
  }

  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');

  if (hash !== signature) {
    return NextResponse.json({ status: 'error', message: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === 'charge.success') {
    const data = event.data;
    console.log('✅ Payment successful via webhook:');
    console.log(`- Reference: ${data.reference}`);
    console.log(`- Amount: ${data.amount / 100} ${data.currency}`);
    console.log(`- Email: ${data.customer.email}`);
    
    // In a full implementation, you would use this event to:
    // 1. Look up the customer and the associated `reportData` in a database.
    // 2. Mark the order as 'paid'.
    // 3. Send a confirmation email with a permanent link to the report.
    // This avoids the reliance on sessionStorage and makes the process foolproof.
  }
  
  // Acknowledge receipt of the event to Paystack
  return NextResponse.json({ status: 'success' });
}
