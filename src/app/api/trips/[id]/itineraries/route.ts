import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createItinerarySchema = z.object({
  date: z.string().transform((str) => new Date(str)),
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

    // Get itineraries with activities
    const itineraries = await prisma.itinerary.findMany({
      where: {
        tripId,
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
        photos: true,
        _count: {
          select: {
            activities: true,
            photos: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(itineraries);
  } catch (error) {
    console.error('Error fetching itineraries:', error);
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

    // Validate date is within trip dates
    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);
    const itineraryDate = new Date(validatedData.date);

    if (itineraryDate < tripStart || itineraryDate > tripEnd) {
      return NextResponse.json(
        { message: 'La fecha debe estar dentro del rango del viaje' },
        { status: 400 }
      );
    }

    // Check if itinerary already exists for this date
    const existingItinerary = await prisma.itinerary.findFirst({
      where: {
        tripId,
        date: {
          gte: new Date(itineraryDate.getFullYear(), itineraryDate.getMonth(), itineraryDate.getDate()),
          lt: new Date(itineraryDate.getFullYear(), itineraryDate.getMonth(), itineraryDate.getDate() + 1),
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
        photos: true,
        _count: {
          select: {
            activities: true,
            photos: true,
          },
        },
      },
    });

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