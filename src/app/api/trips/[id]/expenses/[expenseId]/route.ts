import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateExpenseSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida').optional(),
  amount: z.number().positive('El monto debe ser positivo').optional(),
  currency: z.string().min(1, 'La moneda es requerida').optional(),
  date: z.string().transform((str) => new Date(str)).optional(),
  category: z.string().min(1, 'La categoría es requerida').optional(),
  location: z.string().optional(),
  receiptUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  budgetId: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; expenseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, expenseId } = params;

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

    // Get expense
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        tripId,
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

    if (!expense) {
      return NextResponse.json({ message: 'Gasto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; expenseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, expenseId } = params;
    const body = await request.json();

    // Validate input
    const validatedData = updateExpenseSchema.parse(body);

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

    // Verify expense exists
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        tripId,
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ message: 'Gasto no encontrado' }, { status: 404 });
    }

    // Validate expense date is within trip range if provided
    if (validatedData.date) {
      const tripStart = new Date(trip.startDate);
      const tripEnd = new Date(trip.endDate);
      
      if (validatedData.date < tripStart || validatedData.date > tripEnd) {
        return NextResponse.json(
          { message: 'La fecha del gasto debe estar dentro del rango del viaje' },
          { status: 400 }
        );
      }
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

    // Update expense
    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: validatedData,
      include: {
        budget: {
          select: {
            id: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating expense:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; expenseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, expenseId } = params;

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

    // Verify expense exists
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        tripId,
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ message: 'Gasto no encontrado' }, { status: 404 });
    }

    // Delete expense
    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return NextResponse.json({ message: 'Gasto eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}