import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeId = searchParams.get('typeId');

    if (!typeId) {
      return new NextResponse('Type ID is required', { status: 400 });
    }

    const options = await prisma.variantOption.findMany({
      where: {
        variantTypeId: parseInt(typeId),
      },
      orderBy: {
        value: 'asc',
      },
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error('[VARIANT_OPTIONS_GET]', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
