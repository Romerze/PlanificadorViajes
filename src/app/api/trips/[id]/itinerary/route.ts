import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createItinerarySchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  notes: z.string().optional(),
  activities: z.array(z.object({
    activityId: z.string(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    order: z.number(),
    notes: z.string().optional(),
  })).optional(),
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    let whereClause: any = { tripId };
    if (dateParam) {
      const date = new Date(dateParam);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      whereClause.date = {
        gte: date,
        lt: nextDay,
      };
    }

    // Fetch itineraries with activities
    const itineraries = await prisma.itinerary.findMany({
      where: whereClause,
      include: {
        activities: {
          include: {
            activity: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Get statistics
    const totalDays = await prisma.itinerary.count({
      where: { tripId },
    });

    const totalActivities = await prisma.itineraryActivity.count({
      where: {
        itinerary: {
          tripId,
        },
      },
    });

    // Get activity categories distribution
    const categoryStats = await prisma.activity.groupBy({
      by: ['category'],
      where: {
        tripId,
        itineraryActivities: {
          some: {},
        },
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      itineraries,
      statistics: {
        totalDays,
        totalActivities,
        categoryDistribution: categoryStats.map(stat => ({
          category: stat.category,
          count: stat._count.id,
        })),
      },
    });

  } catch (error) {
    console.error('Error fetching itinerary:', error);
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
    const validatedData = createItinerarySchema.parse(body);

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

    // Check if itinerary for this date already exists
    const existingItinerary = await prisma.itinerary.findFirst({
      where: {
        tripId,
        date: {
          gte: new Date(validatedData.date.getFullYear(), validatedData.date.getMonth(), validatedData.date.getDate()),
          lt: new Date(validatedData.date.getFullYear(), validatedData.date.getMonth(), validatedData.date.getDate() + 1),
        },
      },
    });

    if (existingItinerary) {
      return NextResponse.json(
        { message: 'Ya existe un itinerario para esta fecha' },
        { status: 400 }
      );
    }

    // Create itinerary
    const itinerary = await prisma.itinerary.create({
      data: {
        tripId,
        date: validatedData.date,
        notes: validatedData.notes,
      },
      include: {
        activities: {
          include: {
            activity: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    // Add activities if provided
    if (validatedData.activities && validatedData.activities.length > 0) {
      await Promise.all(
        validatedData.activities.map((activityData) =>
          prisma.itineraryActivity.create({
            data: {
              itineraryId: itinerary.id,
              activityId: activityData.activityId,
              startTime: activityData.startTime ? new Date(`${validatedData.date.toISOString().split('T')[0]}T${activityData.startTime}:00`) : null,
              endTime: activityData.endTime ? new Date(`${validatedData.date.toISOString().split('T')[0]}T${activityData.endTime}:00`) : null,
              order: activityData.order,
              notes: activityData.notes,
            },
          })
        )
      );

      // Fetch the complete itinerary with activities
      const completeItinerary = await prisma.itinerary.findUnique({
        where: { id: itinerary.id },
        include: {
          activities: {
            include: {
              activity: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      return NextResponse.json(completeItinerary, { status: 201 });
    }

    return NextResponse.json(itinerary, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating itinerary:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}