import { NextResponse } from 'next/server';
import { verifyIdentity } from '@/ai/flows/verify-identity';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await verifyIdentity(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API verify-identity error:', error);
    return NextResponse.json({
      isValidIdentity: false,
      reason: 'Verification failed due to server error.'
    }, { status: 500 });
  }
}
