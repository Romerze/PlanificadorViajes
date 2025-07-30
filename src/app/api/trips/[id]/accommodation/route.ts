import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createAccommodationSchema = z.object({
  name: z.string().min(1, 'El nombre del hospedaje es requerido'),
  type: z.enum(['HOTEL', 'HOSTEL', 'AIRBNB', 'APARTMENT', 'HOUSE', 'OTHER']),
  address: z.string().min(1, 'La dirección es requerida'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  checkInDate: z.string().transform((str) => new Date(str)),
  checkOutDate: z.string().transform((str) => new Date(str)),
  pricePerNight: z.number().positive().optional(),
  totalPrice: z.number().positive().optional(),
  currency: z.string().optional(),
  bookingUrl: z.string().url().optional().or(z.literal('')),
  confirmationCode: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
}).refine((data) => data.checkOutDate > data.checkInDate, {
  message: 'La fecha de checkout debe ser posterior a la fecha de checkin',
  path: ['checkOutDate'],
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

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      tripId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { confirmationCode: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    // Get accommodation with pagination
    const [accommodation, total] = await Promise.all([
      prisma.accommodation.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          checkInDate: 'asc',
        },
      }),
      prisma.accommodation.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      accommodation,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching accommodation:', error);
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
    const validatedData = createAccommodationSchema.parse(body);

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

    // Validate dates are within trip range
    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);
    
    if (validatedData.checkInDate < tripStart || validatedData.checkOutDate > tripEnd) {
      return NextResponse.json(
        { message: 'Las fechas del hospedaje deben estar dentro del rango del viaje' },
        { status: 400 }
      );
    }

    // Check for overlapping accommodations
    const overlapping = await prisma.accommodation.findFirst({
      where: {
        tripId,
        OR: [
          {
            AND: [
              { checkInDate: { lte: validatedData.checkInDate } },
              { checkOutDate: { gt: validatedData.checkInDate } },
            ],
          },
          {
            AND: [
              { checkInDate: { lt: validatedData.checkOutDate } },
              { checkOutDate: { gte: validatedData.checkOutDate } },
            ],
          },
          {
            AND: [
              { checkInDate: { gte: validatedData.checkInDate } },
              { checkOutDate: { lte: validatedData.checkOutDate } },
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

    // Create accommodation
    const accommodation = await prisma.accommodation.create({
      data: {
        tripId,
        ...validatedData,
      },
    });

    return NextResponse.json(accommodation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating accommodation:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}