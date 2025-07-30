import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateAccommodationSchema = z.object({
  name: z.string().min(1, 'El nombre del hospedaje es requerido').optional(),
  type: z.enum(['HOTEL', 'HOSTEL', 'AIRBNB', 'APARTMENT', 'HOUSE', 'OTHER']).optional(),
  address: z.string().min(1, 'La dirección es requerida').optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  checkInDate: z.string().transform((str) => new Date(str)).optional(),
  checkOutDate: z.string().transform((str) => new Date(str)).optional(),
  pricePerNight: z.number().positive().optional(),
  totalPrice: z.number().positive().optional(),
  currency: z.string().optional(),
  bookingUrl: z.string().url().optional().or(z.literal('')),
  confirmationCode: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.checkInDate && data.checkOutDate) {
    return data.checkOutDate > data.checkInDate;
  }
  return true;
}, {
  message: 'La fecha de checkout debe ser posterior a la fecha de checkin',
  path: ['checkOutDate'],
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; accommodationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, accommodationId } = params;

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

    // Get accommodation
    const accommodation = await prisma.accommodation.findFirst({
      where: {
        id: accommodationId,
        tripId,
      },
    });

    if (!accommodation) {
      return NextResponse.json({ message: 'Hospedaje no encontrado' }, { status: 404 });
    }

    return NextResponse.json(accommodation);
  } catch (error) {
    console.error('Error fetching accommodation:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; accommodationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, accommodationId } = params;
    const body = await request.json();

    // Validate input
    const validatedData = updateAccommodationSchema.parse(body);

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

    // Verify accommodation exists
    const existingAccommodation = await prisma.accommodation.findFirst({
      where: {
        id: accommodationId,
        tripId,
      },
    });

    if (!existingAccommodation) {
      return NextResponse.json({ message: 'Hospedaje no encontrado' }, { status: 404 });
    }

    // Validate dates are within trip range if provided
    if (validatedData.checkInDate || validatedData.checkOutDate) {
      const tripStart = new Date(trip.startDate);
      const tripEnd = new Date(trip.endDate);
      
      const checkInDate = validatedData.checkInDate || existingAccommodation.checkInDate;
      const checkOutDate = validatedData.checkOutDate || existingAccommodation.checkOutDate;
      
      if (checkInDate < tripStart || checkOutDate > tripEnd) {
        return NextResponse.json(
          { message: 'Las fechas del hospedaje deben estar dentro del rango del viaje' },
          { status: 400 }
        );
      }

      // Check for overlapping accommodations (excluding current one)
      const overlapping = await prisma.accommodation.findFirst({
        where: {
          tripId,
          id: { not: accommodationId },
          OR: [
            {
              AND: [
                { checkInDate: { lte: checkInDate } },
                { checkOutDate: { gt: checkInDate } },
              ],
            },
            {
              AND: [
                { checkInDate: { lt: checkOutDate } },
                { checkOutDate: { gte: checkOutDate } },
              ],
            },
            {
              AND: [
                { checkInDate: { gte: checkInDate } },
                { checkOutDate: { lte: checkOutDate } },
              ],
            },
          ],
        },
      });

      if (overlapping) {
        return NextResponse.json(
          { message: 'Ya tienes un hospedaje reservado para estas fechas' },
          { status: 400 }
        );
      }
    }

    // Update accommodation
    const updatedAccommodation = await prisma.accommodation.update({
      where: { id: accommodationId },
      data: validatedData,
    });

    return NextResponse.json(updatedAccommodation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating accommodation:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; accommodationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, accommodationId } = params;

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

    // Verify accommodation exists
    const existingAccommodation = await prisma.accommodation.findFirst({
      where: {
        id: accommodationId,
        tripId,
      },
    });

    if (!existingAccommodation) {
      return NextResponse.json({ message: 'Hospedaje no encontrado' }, { status: 404 });
    }

    // Delete accommodation
    await prisma.accommodation.delete({
      where: { id: accommodationId },
    });

    return NextResponse.json({ message: 'Hospedaje eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting accommodation:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}