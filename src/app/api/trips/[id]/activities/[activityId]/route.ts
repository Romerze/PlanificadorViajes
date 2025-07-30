import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateActivitySchema = z.object({
  name: z.string().min(1, 'El nombre de la actividad es requerido').optional(),
  category: z.enum(['CULTURAL', 'FOOD', 'NATURE', 'ADVENTURE', 'SHOPPING', 'ENTERTAINMENT', 'OTHER']).optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  price: z.number().positive().optional(),
  currency: z.string().optional(),
  durationHours: z.number().positive().optional(),
  openingHours: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, activityId } = params;

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

    // Get activity
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        tripId,
      },
      include: {
        _count: {
          select: {
            itineraryActivities: true,
            photos: true,
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json({ message: 'Actividad no encontrada' }, { status: 404 });
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, activityId } = params;
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

    // Verify activity exists
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        tripId,
      },
    });

    if (!existingActivity) {
      return NextResponse.json({ message: 'Actividad no encontrada' }, { status: 404 });
    }

    // Update activity
    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: validatedData,
      include: {
        _count: {
          select: {
            itineraryActivities: true,
            photos: true,
          },
        },
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

    console.error('Error updating activity:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, activityId } = params;

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

    // Verify activity exists
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        tripId,
      },
    });

    if (!existingActivity) {
      return NextResponse.json({ message: 'Actividad no encontrada' }, { status: 404 });
    }

    // Check if activity is used in any itineraries
    const itineraryActivities = await prisma.itineraryActivity.findMany({
      where: { activityId },
    });

    if (itineraryActivities.length > 0) {
      return NextResponse.json(
        { 
          message: `No se puede eliminar la actividad porque está siendo utilizada en ${itineraryActivities.length} itinerario(s)` 
        },
        { status: 400 }
      );
    }

    // Delete activity
    await prisma.activity.delete({
      where: { id: activityId },
    });

    return NextResponse.json({ message: 'Actividad eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}