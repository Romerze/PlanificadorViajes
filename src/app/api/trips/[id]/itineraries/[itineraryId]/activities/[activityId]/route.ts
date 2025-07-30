import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateActivitySchema = z.object({
  startTime: z.string().transform((str) => new Date(str)).optional(),
  endTime: z.string().transform((str) => new Date(str)).optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; itineraryId: string; activityId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, itineraryId, activityId } = params;

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

    // Get itinerary activity
    const itineraryActivity = await prisma.itineraryActivity.findFirst({
      where: {
        id: activityId,
        itineraryId,
      },
      include: {
        activity: true,
      },
    });

    if (!itineraryActivity) {
      return NextResponse.json({ message: 'Actividad no encontrada en el itinerario' }, { status: 404 });
    }

    return NextResponse.json(itineraryActivity);
  } catch (error) {
    console.error('Error fetching itinerary activity:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; itineraryId: string; activityId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, itineraryId, activityId } = params;
    const body = await request.json();

    // Validate input
    const validatedData = updateActivitySchema.parse(body);

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

    // Verify itinerary activity exists
    const existingActivity = await prisma.itineraryActivity.findFirst({
      where: {
        id: activityId,
        itineraryId,
      },
    });

    if (!existingActivity) {
      return NextResponse.json({ message: 'Actividad no encontrada en el itinerario' }, { status: 404 });
    }

    // Validate time range if both times are provided
    if (validatedData.startTime && validatedData.endTime) {
      if (validatedData.startTime >= validatedData.endTime) {
        return NextResponse.json(
          { message: 'La hora de inicio debe ser anterior a la hora de fin' },
          { status: 400 }
        );
      }
    }

    // Update itinerary activity
    const updatedActivity = await prisma.itineraryActivity.update({
      where: { id: activityId },
      data: validatedData,
      include: {
        activity: true,
      },
    });

    return NextResponse.json(updatedActivity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating itinerary activity:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itineraryId: string; activityId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, itineraryId, activityId } = params;

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

    // Verify itinerary activity exists
    const existingActivity = await prisma.itineraryActivity.findFirst({
      where: {
        id: activityId,
        itineraryId,
      },
    });

    if (!existingActivity) {
      return NextResponse.json({ message: 'Actividad no encontrada en el itinerario' }, { status: 404 });
    }

    // Delete itinerary activity
    await prisma.itineraryActivity.delete({
      where: { id: activityId },
    });

    // Reorder remaining activities
    const remainingActivities = await prisma.itineraryActivity.findMany({
      where: { itineraryId },
      orderBy: { order: 'asc' },
    });

    const reorderPromises = remainingActivities.map((activity, index) =>
      prisma.itineraryActivity.update({
        where: { id: activity.id },
        data: { order: index + 1 },
      })
    );

    await Promise.all(reorderPromises);

    return NextResponse.json({ message: 'Actividad eliminada del itinerario exitosamente' });
  } catch (error) {
    console.error('Error deleting itinerary activity:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}