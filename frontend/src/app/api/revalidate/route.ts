import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  const expectedSecret = process.env.REVALIDATE_SECRET_TOKEN;

  // Security check: Validate secret token
  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json({ message: 'Invalid revalidation secret token' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { path, slug, category } = body;

    const revalidatedPaths: string[] = [];

    // 1. Revalidate specific path if provided
    if (path) {
      revalidatePath(path);
      revalidatedPaths.push(path);
    }

    // 2. Revalidate detail pages if slug provided
    if (slug) {
      const jobPath = `/job/${slug}`;
      const schemePath = `/schemes/${slug}`;
      revalidatePath(jobPath);
      revalidatePath(schemePath);
      revalidatedPaths.push(jobPath, schemePath);
    }

    // 3. Revalidate category list if provided
    if (category) {
      const catPath = category.startsWith('/') ? category : `/${category}`;
      revalidatePath(catPath);
      revalidatedPaths.push(catPath);
    }

    // 4. Always revalidate key listing pages when data changes
    revalidatePath('/');
    revalidatePath('/jobs');
    revalidatePath('/today');
    revalidatedPaths.push('/', '/jobs', '/today');

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      paths: Array.from(new Set(revalidatedPaths)),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error triggering revalidation', error: String(error) },
      { status: 500 }
    );
  }
}
