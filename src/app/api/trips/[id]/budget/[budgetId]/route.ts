import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateBudgetSchema = z.object({
  category: z.enum(['TRANSPORT', 'ACCOMMODATION', 'FOOD', 'ACTIVITIES', 'SHOPPING', 'EMERGENCY', 'OTHER']).optional(),
  plannedAmount: z.number().positive('El monto planificado debe ser positivo').optional(),
  currency: z.string().min(1, 'La moneda es requerida').optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; budgetId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, budgetId } = params;

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

    // Get budget item
    const budget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        tripId,
      },
      include: {
        expenses: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    if (!budget) {
      return NextResponse.json({ message: 'Presupuesto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; budgetId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, budgetId } = params;
    const body = await request.json();

    // Validate input
    const validatedData = updateBudgetSchema.parse(body);

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

    // Verify budget exists
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        tripId,
      },
    });

    if (!existingBudget) {
      return NextResponse.json({ message: 'Presupuesto no encontrado' }, { status: 404 });
    }

    // Check if category already exists for this trip (if changing category)
    if (validatedData.category && validatedData.category !== existingBudget.category) {
      const categoryExists = await prisma.budget.findFirst({
        where: {
          tripId,
          category: validatedData.category,
          id: { not: budgetId },
        },
      });

      if (categoryExists) {
        return NextResponse.json(
          { message: 'Ya existe un presupuesto para esta categoría' },
          { status: 400 }
        );
      }
    }

    // Update budget
    const updatedBudget = await prisma.budget.update({
      where: { id: budgetId },
      data: validatedData,
    });

    return NextResponse.json(updatedBudget);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating budget:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; budgetId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, budgetId } = params;

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

    // Verify budget exists
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        tripId,
      },
    });

    if (!existingBudget) {
      return NextResponse.json({ message: 'Presupuesto no encontrado' }, { status: 404 });
    }

    // Delete budget (expenses will be unlinked, not deleted)
    await prisma.budget.delete({
      where: { id: budgetId },
    });

    return NextResponse.json({ message: 'Presupuesto eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}