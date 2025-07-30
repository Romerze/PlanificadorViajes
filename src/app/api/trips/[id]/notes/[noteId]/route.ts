import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateNoteSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, 'El contenido de la nota es requerido').optional(),
  type: z.enum(['GENERAL', 'IMPORTANT', 'REMINDER', 'IDEA']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const tripId = params.id;
    const noteId = params.noteId;

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

    // Fetch specific note
    const note = await prisma.tripNote.findFirst({
      where: {
        id: noteId,
        tripId,
      },
    });

    if (!note) {
      return NextResponse.json({ message: 'Nota no encontrada' }, { status: 404 });
    }

    return NextResponse.json(note);

  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const tripId = params.id;
    const noteId = params.noteId;
    const body = await request.json();

    // Validate request body
    const validatedData = updateNoteSchema.parse(body);

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

    // Verify note exists
    const existingNote = await prisma.tripNote.findFirst({
      where: {
        id: noteId,
        tripId,
      },
    });

    if (!existingNote) {
      return NextResponse.json({ message: 'Nota no encontrada' }, { status: 404 });
    }

    // Update note
    const updatedNote = await prisma.tripNote.update({
      where: { id: noteId },
      data: validatedData,
    });

    return NextResponse.json(updatedNote);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating note:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const tripId = params.id;
    const noteId = params.noteId;

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

    // Verify note exists
    const existingNote = await prisma.tripNote.findFirst({
      where: {
        id: noteId,
        tripId,
      },
    });

    if (!existingNote) {
      return NextResponse.json({ message: 'Nota no encontrada' }, { status: 404 });
    }

    // Delete note
    await prisma.tripNote.delete({
      where: { id: noteId },
    });

    return NextResponse.json({ message: 'Nota eliminada exitosamente' });

  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}