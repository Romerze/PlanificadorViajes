import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createExpenseSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida'),
  amount: z.number().positive('El monto debe ser positivo'),
  currency: z.string().min(1, 'La moneda es requerida'),
  date: z.string().transform((str) => new Date(str)),
  category: z.string().min(1, 'La categoría es requerida'),
  location: z.string().optional(),
  receiptUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  budgetId: z.string().optional(),
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
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      tripId,
    };

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    // Get expenses with pagination
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        include: {
          budget: {
            select: {
              id: true,
              category: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      }),
      prisma.expense.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Get expense summary by category
    const categoryTotals = await prisma.expense.groupBy({
      by: ['category'],
      where: { tripId },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const totalSpent = categoryTotals.reduce((sum, cat) => {
      return sum + parseFloat(cat._sum.amount?.toString() || '0');
    }, 0);

    return NextResponse.json({
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
      summary: {
        totalSpent,
        totalExpenses: total,
        categoryTotals: categoryTotals.map(cat => ({
          category: cat.category,
          total: parseFloat(cat._sum.amount?.toString() || '0'),
          count: cat._count.id,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
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
    const validatedData = createExpenseSchema.parse(body);

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

    // Validate expense date is within trip range
    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);
    
    if (validatedData.date < tripStart || validatedData.date > tripEnd) {
      return NextResponse.json(
        { message: 'La fecha del gasto debe estar dentro del rango del viaje' },
        { status: 400 }
      );
    }

    // Verify budget exists if provided
    if (validatedData.budgetId) {
      const budget = await prisma.budget.findFirst({
        where: {
          id: validatedData.budgetId,
          tripId,
        },
      });

      if (!budget) {
        return NextResponse.json(
          { message: 'Presupuesto no encontrado' },
          { status: 404 }
        );
      }
    }

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        tripId,
        ...validatedData,
      },
      include: {
        budget: {
          select: {
            id: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating expense:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}