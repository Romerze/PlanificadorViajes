import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createBudgetSchema = z.object({
  category: z.enum(['TRANSPORT', 'ACCOMMODATION', 'FOOD', 'ACTIVITIES', 'SHOPPING', 'EMERGENCY', 'OTHER']),
  plannedAmount: z.number().positive('El monto planificado debe ser positivo'),
  currency: z.string().min(1, 'La moneda es requerida'),
  notes: z.string().optional(),
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

    // Get budget with expenses aggregated
    const budget = await prisma.budget.findMany({
      where: { tripId },
      include: {
        expenses: {
          select: {
            amount: true,
            currency: true,
          },
        },
      },
      orderBy: {
        category: 'asc',
      },
    });

    // Calculate actual amounts from expenses
    const budgetWithActual = budget.map(item => {
      const expenseTotal = item.expenses.reduce((sum, expense) => {
        // Convert to same currency if needed (simplified - in real app would need proper conversion)
        return sum + parseFloat(expense.amount.toString());
      }, 0);

      return {
        ...item,
        actualAmount: expenseTotal,
        expenses: undefined, // Remove expenses from response
      };
    });

    // Get summary statistics
    const totalPlanned = budgetWithActual.reduce((sum, item) => sum + parseFloat(item.plannedAmount.toString()), 0);
    const totalActual = budgetWithActual.reduce((sum, item) => sum + item.actualAmount, 0);

    return NextResponse.json({
      budget: budgetWithActual,
      summary: {
        totalPlanned,
        totalActual,
        remaining: totalPlanned - totalActual,
        percentageUsed: totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching budget:', error);
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
    const validatedData = createBudgetSchema.parse(body);

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

    // Check if category already exists for this trip
    const existingBudget = await prisma.budget.findFirst({
      where: {
        tripId,
        category: validatedData.category,
      },
    });

    if (existingBudget) {
      return NextResponse.json(
        { message: 'Ya existe un presupuesto para esta categoría' },
        { status: 400 }
      );
    }

    // Create budget
    const budget = await prisma.budget.create({
      data: {
        tripId,
        ...validatedData,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating budget:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}