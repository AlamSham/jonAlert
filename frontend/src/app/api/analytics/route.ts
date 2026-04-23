import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();
    
    // Log the metric (in production, you might want to send this to a proper analytics service)
    console.log('Web Vitals Metric:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    });
    
    // You can extend this to send metrics to your analytics service
    // For example: Google Analytics, Vercel Analytics, or a custom backend
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing analytics:', error);
    return NextResponse.json({ error: 'Failed to process analytics' }, { status: 500 });
  }
}

// Handle OPTIONS for CORS if needed
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
