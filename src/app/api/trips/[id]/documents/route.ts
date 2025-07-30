import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createDocumentSchema = z.object({
  name: z.string().min(1, 'El nombre del documento es requerido'),
  type: z.enum(['PASSPORT', 'VISA', 'TICKET', 'RESERVATION', 'INSURANCE', 'OTHER']),
  fileUrl: z.string().min(1, 'URL de archivo requerida').refine(
    (url) => url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://'),
    'URL de archivo inválida'
  ),
  fileType: z.string().min(1, 'El tipo de archivo es requerido'),
  fileSize: z.number().positive('El tamaño del archivo debe ser positivo'),
  expiryDate: z.string().transform((str) => new Date(str)).optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const tripId = params.id;

    // Verify trip ownership
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        userId: session.user.id,
      },
    });

    if (!trip) {
      return NextResponse.json({ message: 'Viaje no encontrado' }, { status: 404 });
    }

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      tripId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    // Get documents with pagination
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.document.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Get document statistics by type
    const typeStats = await prisma.document.groupBy({
      by: ['type'],
      where: { tripId },
      _count: {
        id: true,
      },
    });

    // Check for expiring documents (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringDocuments = await prisma.document.findMany({
      where: {
        tripId,
        expiryDate: {
          not: null,
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        expiryDate: true,
      },
    });

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
      statistics: {
        total,
        byType: typeStats.map(stat => ({
          type: stat.type,
          count: stat._count.id,
        })),
        expiring: expiringDocuments.length,
        expiringDocuments,
      },
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const tripId = params.id;
    const body = await request.json();

    // Validate input
    const validatedData = createDocumentSchema.parse(body);

    // Verify trip ownership
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        userId: session.user.id,
      },
    });

    if (!trip) {
      return NextResponse.json({ message: 'Viaje no encontrado' }, { status: 404 });
    }

    // Check for duplicate document names
    const existingDocument = await prisma.document.findFirst({
      where: {
        tripId,
        name: validatedData.name,
      },
    });

    if (existingDocument) {
      return NextResponse.json(
        { message: 'Ya existe un documento con este nombre' },
        { status: 400 }
      );
    }

    // Validate expiry date is in the future if provided
    if (validatedData.expiryDate && validatedData.expiryDate <= new Date()) {
      return NextResponse.json(
        { message: 'La fecha de vencimiento debe ser futura' },
        { status: 400 }
      );
    }

    // Create document
    const document = await prisma.document.create({
      data: {
        tripId,
        ...validatedData,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating document:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}