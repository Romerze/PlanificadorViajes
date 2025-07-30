import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createNoteSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, 'El contenido de la nota es requerido'),
  type: z.enum(['GENERAL', 'IMPORTANT', 'REMINDER', 'IDEA']).default('GENERAL'),
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { tripId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    // Fetch notes
    const [notes, total] = await Promise.all([
      prisma.tripNote.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          updatedAt: 'desc',
        },
      }),
      prisma.tripNote.count({ where }),
    ]);

    // Get statistics
    const totalNotes = await prisma.tripNote.count({
      where: { tripId },
    });

    const typeStats = await prisma.tripNote.groupBy({
      by: ['type'],
      where: { tripId },
      _count: {
        id: true,
      },
    });

    const recentNotes = await prisma.tripNote.count({
      where: {
        tripId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      notes,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
      statistics: {
        total: totalNotes,
        recent: recentNotes,
        byType: typeStats.map(stat => ({
          type: stat.type,
          count: stat._count.id,
        })),
      },
    });

  } catch (error) {
    console.error('Error fetching notes:', error);
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

    // Validate request body
    const validatedData = createNoteSchema.parse(body);

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

    // Create note
    const note = await prisma.tripNote.create({
      data: {
        tripId,
        ...validatedData,
      },
    });

    return NextResponse.json(note, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating note:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}