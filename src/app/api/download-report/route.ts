import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    console.error("The /api/download-report endpoint is deprecated and should not be called.");
    return NextResponse.json(
        { error: 'This feature has been removed. Please use the on-site report page.' }, 
        { status: 410 } // 410 Gone
    );
}
