import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const addActivitySchema = z.object({
  activityId: z.string(),
  startTime: z.string().transform((str) => new Date(str)).optional(),
  endTime: z.string().transform((str) => new Date(str)).optional(),
  notes: z.string().optional(),
});

const reorderActivitiesSchema = z.object({
  activities: z.array(z.object({
    id: z.string(),
    order: z.number(),
  })),
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

    // Verify itinerary exists
    const itinerary = await prisma.itinerary.findFirst({
      where: {
        id: itineraryId,
        tripId,
      },
    });

    if (!itinerary) {
      return NextResponse.json({ message: 'Itinerario no encontrado' }, { status: 404 });
    }

    // Get itinerary activities
    const activities = await prisma.itineraryActivity.findMany({
      where: {
        itineraryId,
      },
      include: {
        activity: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching itinerary activities:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const validatedData = addActivitySchema.parse(body);

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
    const itinerary = await prisma.itinerary.findFirst({
      where: {
        id: itineraryId,
        tripId,
      },
    });

    if (!itinerary) {
      return NextResponse.json({ message: 'Itinerario no encontrado' }, { status: 404 });
    }

    // Verify activity exists and belongs to the trip
    const activity = await prisma.activity.findFirst({
      where: {
        id: validatedData.activityId,
        tripId,
      },
    });

    if (!activity) {
      return NextResponse.json({ message: 'Actividad no encontrada' }, { status: 404 });
    }

    // Check if activity is already in this itinerary
    const existingActivity = await prisma.itineraryActivity.findFirst({
      where: {
        itineraryId,
        activityId: validatedData.activityId,
      },
    });

    if (existingActivity) {
      return NextResponse.json(
        { message: 'La actividad ya está en este itinerario' },
        { status: 400 }
      );
    }

    // Get next order number
    const lastActivity = await prisma.itineraryActivity.findFirst({
      where: { itineraryId },
      orderBy: { order: 'desc' },
    });
    const nextOrder = (lastActivity?.order || 0) + 1;

    // Add activity to itinerary
    const itineraryActivity = await prisma.itineraryActivity.create({
      data: {
        itineraryId,
        activityId: validatedData.activityId,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        notes: validatedData.notes,
        order: nextOrder,
      },
      include: {
        activity: true,
      },
    });

    return NextResponse.json(itineraryActivity, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error adding activity to itinerary:', error);
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
    const validatedData = reorderActivitiesSchema.parse(body);

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
    const itinerary = await prisma.itinerary.findFirst({
      where: {
        id: itineraryId,
        tripId,
      },
    });

    if (!itinerary) {
      return NextResponse.json({ message: 'Itinerario no encontrado' }, { status: 404 });
    }

    // Update order for each activity
    const updatePromises = validatedData.activities.map(({ id, order }) =>
      prisma.itineraryActivity.update({
        where: { id },
        data: { order },
      })
    );

    await Promise.all(updatePromises);

    // Get updated activities
    const updatedActivities = await prisma.itineraryActivity.findMany({
      where: { itineraryId },
      include: { activity: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(updatedActivities);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error reordering activities:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}