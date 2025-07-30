import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createTransportationSchema = z.object({
  type: z.enum(['FLIGHT', 'BUS', 'TRAIN', 'CAR', 'BOAT', 'OTHER']),
  company: z.string().optional(),
  departureLocation: z.string().min(1, 'La ubicación de salida es requerida'),
  arrivalLocation: z.string().min(1, 'La ubicación de llegada es requerida'),
  departureDatetime: z.string().transform((str) => new Date(str)),
  arrivalDatetime: z.string().transform((str) => new Date(str)),
  confirmationCode: z.string().optional(),
  price: z.number().positive().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.arrivalDatetime > data.departureDatetime, {
  message: 'La fecha de llegada debe ser posterior a la fecha de salida',
  path: ['arrivalDatetime'],
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
        { company: { contains: search, mode: 'insensitive' } },
        { departureLocation: { contains: search, mode: 'insensitive' } },
        { arrivalLocation: { contains: search, mode: 'insensitive' } },
        { confirmationCode: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    // Get transportation with pagination
    const [transportation, total] = await Promise.all([
      prisma.transportation.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          departureDatetime: 'asc',
        },
      }),
      prisma.transportation.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      transportation,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching transportation:', error);
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
    const validatedData = createTransportationSchema.parse(body);

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
    
    if (validatedData.departureDatetime < tripStart || validatedData.arrivalDatetime > tripEnd) {
      return NextResponse.json(
        { message: 'Las fechas del transporte deben estar dentro del rango del viaje' },
        { status: 400 }
      );
    }

    // Create transportation
    const transportation = await prisma.transportation.create({
      data: {
        tripId,
        ...validatedData,
      },
    });

    return NextResponse.json(transportation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating transportation:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}