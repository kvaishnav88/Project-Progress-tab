import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'AuraGen frontend API is ready',
    status: 'ok',
  });
}
