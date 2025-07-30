import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateItinerarySchema = z.object({
  date: z.string().transform((str) => new Date(str)).optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; itineraryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, itineraryId } = params;

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

    // Get itinerary with activities
    const itinerary = await prisma.itinerary.findFirst({
      where: {
        id: itineraryId,
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
    });

    if (!itinerary) {
      return NextResponse.json({ message: 'Itinerario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; itineraryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, itineraryId } = params;
    const body = await request.json();

    // Validate input
    const validatedData = updateItinerarySchema.parse(body);

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

    // Verify itinerary exists
    const existingItinerary = await prisma.itinerary.findFirst({
      where: {
        id: itineraryId,
        tripId,
      },
    });

    if (!existingItinerary) {
      return NextResponse.json({ message: 'Itinerario no encontrado' }, { status: 404 });
    }

    // If date is being updated, validate it
    if (validatedData.date) {
      const tripStart = new Date(trip.startDate);
      const tripEnd = new Date(trip.endDate);
      const newDate = new Date(validatedData.date);

      if (newDate < tripStart || newDate > tripEnd) {
        return NextResponse.json(
          { message: 'La fecha debe estar dentro del rango del viaje' },
          { status: 400 }
        );
      }

      // Check if another itinerary exists for this date
      const conflictingItinerary = await prisma.itinerary.findFirst({
        where: {
          tripId,
          id: { not: itineraryId },
          date: {
            gte: new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()),
            lt: new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate() + 1),
          },
        },
      });

      if (conflictingItinerary) {
        return NextResponse.json(
          { message: 'Ya existe un itinerario para esta fecha' },
          { status: 400 }
        );
      }
    }

    // Update itinerary
    const updatedItinerary = await prisma.itinerary.update({
      where: { id: itineraryId },
      data: validatedData,
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

    return NextResponse.json(updatedItinerary);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating itinerary:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itineraryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, itineraryId } = params;

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

    // Verify itinerary exists
    const existingItinerary = await prisma.itinerary.findFirst({
      where: {
        id: itineraryId,
        tripId,
      },
    });

    if (!existingItinerary) {
      return NextResponse.json({ message: 'Itinerario no encontrado' }, { status: 404 });
    }

    // Delete itinerary (cascade will handle activities and photos)
    await prisma.itinerary.delete({
      where: { id: itineraryId },
    });

    return NextResponse.json({ message: 'Itinerario eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}