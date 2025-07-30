import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createPhotoSchema = z.object({
  fileUrl: z.string().min(1, 'URL de archivo requerida').refine(
    (url) => url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://'),
    'URL de archivo inválida'
  ),
  thumbnailUrl: z.string().optional(),
  caption: z.string().optional(),
  takenAt: z.string().transform((str) => new Date(str)).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  itineraryId: z.string().optional(),
  activityId: z.string().optional(),
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
    const itineraryId = searchParams.get('itineraryId');
    const activityId = searchParams.get('activityId');
    const date = searchParams.get('date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { tripId };

    if (itineraryId) {
      where.itineraryId = itineraryId;
    }

    if (activityId) {
      where.activityId = activityId;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      where.OR = [
        {
          takenAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        {
          AND: [
            { takenAt: null },
            {
              itinerary: {
                date: {
                  gte: startDate,
                  lt: endDate,
                },
              },
            },
          ],
        },
      ];
    }

    // Fetch photos with relationships
    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { takenAt: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          itinerary: {
            select: {
              id: true,
              date: true,
            },
          },
          activity: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      }),
      prisma.photo.count({ where }),
    ]);

    // Get statistics
    const totalPhotos = await prisma.photo.count({
      where: { tripId },
    });

    const photosWithLocation = await prisma.photo.count({
      where: {
        tripId,
        latitude: { not: null },
        longitude: { not: null },
      },
    });

    const photosByDate = await prisma.photo.groupBy({
      by: ['itineraryId'],
      where: { tripId },
      _count: {
        id: true,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      photos,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
      statistics: {
        total: totalPhotos,
        withLocation: photosWithLocation,
        byItinerary: photosByDate.map(item => ({
          itineraryId: item.itineraryId,
          count: item._count.id,
        })),
      },
    });

  } catch (error) {
    console.error('Error fetching photos:', error);
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
    const validatedData = createPhotoSchema.parse(body);

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

    // Verify itinerary exists if provided
    if (validatedData.itineraryId) {
      const itinerary = await prisma.itinerary.findFirst({
        where: {
          id: validatedData.itineraryId,
          tripId,
        },
      });

      if (!itinerary) {
        return NextResponse.json({ message: 'Itinerario no encontrado' }, { status: 404 });
      }
    }

    // Verify activity exists if provided
    if (validatedData.activityId) {
      const activity = await prisma.activity.findFirst({
        where: {
          id: validatedData.activityId,
          tripId,
        },
      });

      if (!activity) {
        return NextResponse.json({ message: 'Actividad no encontrada' }, { status: 404 });
      }
    }

    // Create photo
    const photo = await prisma.photo.create({
      data: {
        tripId,
        ...validatedData,
      },
      include: {
        itinerary: {
          select: {
            id: true,
            date: true,
          },
        },
        activity: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json(photo, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating photo:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}