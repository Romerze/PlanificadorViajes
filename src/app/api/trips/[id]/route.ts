import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for trip update
const updateTripSchema = z.object({
  name: z.string().min(1, 'El nombre del viaje es requerido'),
  destination: z.string().min(1, 'El destino es requerido'),
  description: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  coverImageUrl: z.string().optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED']),
}).refine((data) => {
  return data.endDate > data.startDate;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate'],
});

// Helper function to verify trip ownership
async function verifyTripOwnership(tripId: string, userEmail: string) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    return null;
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId: user.id,
    },
  });

  return trip;
}

// GET /api/trips/[id] - Obtener viaje específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const trip = await verifyTripOwnership(params.id, session.user.email);

    if (!trip) {
      return NextResponse.json(
        { error: 'Viaje no encontrado' },
        { status: 404 }
      );
    }

    // Obtener viaje con datos relacionados
    const tripWithDetails = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Solo las últimas 5 actividades
        },
        transportation: {
          orderBy: { departureDatetime: 'asc' },
        },
        accommodation: {
          orderBy: { checkInDate: 'asc' },
        },
        budget: {
          include: {
            expenses: {
              orderBy: { date: 'desc' },
              take: 10, // Solo los últimos 10 gastos
            },
          },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        photos: {
          orderBy: { createdAt: 'desc' },
          take: 20, // Solo las últimas 20 fotos
        },
        notes: {
          orderBy: { updatedAt: 'desc' },
        },
        _count: {
          select: {
            activities: true,
            transportation: true,
            accommodation: true,
            photos: true,
            documents: true,
            notes: true,
          },
        },
      },
    });

    return NextResponse.json(tripWithDetails);
  } catch (error) {
    console.error('Error al obtener viaje:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/trips/[id] - Actualizar viaje
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const trip = await verifyTripOwnership(params.id, session.user.email);

    if (!trip) {
      return NextResponse.json(
        { error: 'Viaje no encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validationResult = updateTripSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    // Actualizar viaje
    const updatedTrip = await prisma.trip.update({
      where: { id: params.id },
      data: validationResult.data,
      include: {
        _count: {
          select: {
            activities: true,
            transportation: true,
            accommodation: true,
            photos: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTrip);
  } catch (error) {
    console.error('Error al actualizar viaje:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/trips/[id] - Eliminar viaje
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const trip = await verifyTripOwnership(params.id, session.user.email);

    if (!trip) {
      return NextResponse.json(
        { error: 'Viaje no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar viaje (cascade eliminará datos relacionados)
    await prisma.trip.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Viaje eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al eliminar viaje:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}