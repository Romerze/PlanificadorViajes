import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateDocumentSchema = z.object({
  name: z.string().min(1, 'El nombre del documento es requerido').optional(),
  type: z.enum(['PASSPORT', 'VISA', 'TICKET', 'RESERVATION', 'INSURANCE', 'OTHER']).optional(),
  fileUrl: z.string().url('URL de archivo inválida').optional(),
  fileType: z.string().min(1, 'El tipo de archivo es requerido').optional(),
  fileSize: z.number().positive('El tamaño del archivo debe ser positivo').optional(),
  expiryDate: z.string().transform((str) => new Date(str)).optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, documentId } = params;

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

    // Get document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        tripId,
      },
    });

    if (!document) {
      return NextResponse.json({ message: 'Documento no encontrado' }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, documentId } = params;
    const body = await request.json();

    // Validate input
    const validatedData = updateDocumentSchema.parse(body);

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

    // Verify document exists
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
        tripId,
      },
    });

    if (!existingDocument) {
      return NextResponse.json({ message: 'Documento no encontrado' }, { status: 404 });
    }

    // Check for duplicate document names (if changing name)
    if (validatedData.name && validatedData.name !== existingDocument.name) {
      const duplicateDocument = await prisma.document.findFirst({
        where: {
          tripId,
          name: validatedData.name,
          id: { not: documentId },
        },
      });

      if (duplicateDocument) {
        return NextResponse.json(
          { message: 'Ya existe un documento con este nombre' },
          { status: 400 }
        );
      }
    }

    // Validate expiry date is in the future if provided
    if (validatedData.expiryDate && validatedData.expiryDate <= new Date()) {
      return NextResponse.json(
        { message: 'La fecha de vencimiento debe ser futura' },
        { status: 400 }
      );
    }

    // Update document
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: validatedData,
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating document:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: tripId, documentId } = params;

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

    // Verify document exists
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
        tripId,
      },
    });

    if (!existingDocument) {
      return NextResponse.json({ message: 'Documento no encontrado' }, { status: 404 });
    }

    // Delete document
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ message: 'Documento eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}