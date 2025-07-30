import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateItinerarySchema = z.object({
  date: z.string().transform((str) => new Date(str)).optional(),
  notes: z.string().optional(),
  activities: z.array(z.object({
    id: z.string().optional(), // For existing activities
    activityId: z.string(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    order: z.number(),
    notes: z.string().optional(),
  })).optional(),
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

    const tripId = params.id;
    const itineraryId = params.itineraryId;

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

    // Fetch specific itinerary
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

    const tripId = params.id;
    const itineraryId = params.itineraryId;
    const body = await request.json();

    // Validate request body
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

    // Update itinerary
    const updateData: any = {};
    if (validatedData.date) updateData.date = validatedData.date;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;

    const updatedItinerary = await prisma.itinerary.update({
      where: { id: itineraryId },
      data: updateData,
    });

    // Update activities if provided
    if (validatedData.activities) {
      // Delete existing activities
      await prisma.itineraryActivity.deleteMany({
        where: { itineraryId },
      });

      // Create new activities
      if (validatedData.activities.length > 0) {
        await Promise.all(
          validatedData.activities.map((activityData) =>
            prisma.itineraryActivity.create({
              data: {
                itineraryId,
                activityId: activityData.activityId,
                startTime: activityData.startTime 
                  ? new Date(`${(validatedData.date || existingItinerary.date).toISOString().split('T')[0]}T${activityData.startTime}:00`) 
                  : null,
                endTime: activityData.endTime 
                  ? new Date(`${(validatedData.date || existingItinerary.date).toISOString().split('T')[0]}T${activityData.endTime}:00`) 
                  : null,
                order: activityData.order,
                notes: activityData.notes,
              },
            })
          )
        );
      }
    }

    // Fetch complete updated itinerary
    const completeItinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId },
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

    return NextResponse.json(completeItinerary);

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

    const tripId = params.id;
    const itineraryId = params.itineraryId;

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

    // Delete itinerary (activities will be deleted automatically due to cascade)
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