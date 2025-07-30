import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateTransportationSchema = z.object({
  type: z.enum(['FLIGHT', 'BUS', 'TRAIN', 'CAR', 'BOAT', 'OTHER']).optional(),
  company: z.string().optional(),
  departureLocation: z.string().min(1, 'La ubicación de salida es requerida').optional(),
  arrivalLocation: z.string().min(1, 'La ubicación de llegada es requerida').optional(),
  departureDatetime: z.string().transform((str) => new Date(str)).optional(),
  arrivalDatetime: z.string().transform((str) => new Date(str)).optional(),
  confirmationCode: z.string().optional(),
  price: z.number().positive().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.departureDatetime && data.arrivalDatetime) {
    return data.arrivalDatetime > data.departureDatetime;
  }
  return true;
}, {
  message: 'La fecha de llegada debe ser posterior a la fecha de salida',
  path: ['arrivalDatetime'],
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; transportationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, transportationId } = params;

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

    // Get transportation
    const transportation = await prisma.transportation.findFirst({
      where: {
        id: transportationId,
        tripId,
      },
    });

    if (!transportation) {
      return NextResponse.json({ message: 'Transporte no encontrado' }, { status: 404 });
    }

    return NextResponse.json(transportation);
  } catch (error) {
    console.error('Error fetching transportation:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; transportationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, transportationId } = params;
    const body = await request.json();

    // Validate input
    const validatedData = updateTransportationSchema.parse(body);

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

    // Verify transportation exists
    const existingTransportation = await prisma.transportation.findFirst({
      where: {
        id: transportationId,
        tripId,
      },
    });

    if (!existingTransportation) {
      return NextResponse.json({ message: 'Transporte no encontrado' }, { status: 404 });
    }

    // Validate dates are within trip range if provided
    if (validatedData.departureDatetime || validatedData.arrivalDatetime) {
      const tripStart = new Date(trip.startDate);
      const tripEnd = new Date(trip.endDate);
      
      const departureDate = validatedData.departureDatetime || existingTransportation.departureDatetime;
      const arrivalDate = validatedData.arrivalDatetime || existingTransportation.arrivalDatetime;
      
      if (departureDate < tripStart || arrivalDate > tripEnd) {
        return NextResponse.json(
          { message: 'Las fechas del transporte deben estar dentro del rango del viaje' },
          { status: 400 }
        );
      }
    }

    // Update transportation
    const updatedTransportation = await prisma.transportation.update({
      where: { id: transportationId },
      data: validatedData,
    });

    return NextResponse.json(updatedTransportation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating transportation:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; transportationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, transportationId } = params;

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

    // Verify transportation exists
    const existingTransportation = await prisma.transportation.findFirst({
      where: {
        id: transportationId,
        tripId,
      },
    });

    if (!existingTransportation) {
      return NextResponse.json({ message: 'Transporte no encontrado' }, { status: 404 });
    }

    // Delete transportation
    await prisma.transportation.delete({
      where: { id: transportationId },
    });

    return NextResponse.json({ message: 'Transporte eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting transportation:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}