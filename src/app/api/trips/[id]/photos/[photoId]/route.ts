import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updatePhotoSchema = z.object({
  caption: z.string().optional(),
  takenAt: z.string().transform((str) => new Date(str)).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  itineraryId: z.string().optional(),
  activityId: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; photoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const tripId = params.id;
    const photoId = params.photoId;

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

    // Fetch specific photo
    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        tripId,
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

    if (!photo) {
      return NextResponse.json({ message: 'Foto no encontrada' }, { status: 404 });
    }

    return NextResponse.json(photo);

  } catch (error) {
    console.error('Error fetching photo:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; photoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const tripId = params.id;
    const photoId = params.photoId;
    const body = await request.json();

    // Validate request body
    const validatedData = updatePhotoSchema.parse(body);

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

    // Verify photo exists
    const existingPhoto = await prisma.photo.findFirst({
      where: {
        id: photoId,
        tripId,
      },
    });

    if (!existingPhoto) {
      return NextResponse.json({ message: 'Foto no encontrada' }, { status: 404 });
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

    // Update photo
    const updatedPhoto = await prisma.photo.update({
      where: { id: photoId },
      data: validatedData,
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

    return NextResponse.json(updatedPhoto);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating photo:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; photoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const tripId = params.id;
    const photoId = params.photoId;

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

    // Verify photo exists
    const existingPhoto = await prisma.photo.findFirst({
      where: {
        id: photoId,
        tripId,
      },
    });

    if (!existingPhoto) {
      return NextResponse.json({ message: 'Foto no encontrada' }, { status: 404 });
    }

    // Delete photo
    await prisma.photo.delete({
      where: { id: photoId },
    });

    return NextResponse.json({ message: 'Foto eliminada exitosamente' });

  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}