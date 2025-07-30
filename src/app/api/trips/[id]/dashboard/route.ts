import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    // Get all statistics in parallel
    const [
      transportationStats,
      accommodationStats,
      activityStats,
      budgetStats,
      expenseStats,
      documentStats,
      itineraryStats,
      photoStats,
      noteStats,
      tripDetails
    ] = await Promise.all([
      // Transportation
      prisma.transportation.aggregate({
        where: { tripId },
        _count: { id: true },
        _sum: { price: true },
      }),

      // Accommodation  
      prisma.accommodation.aggregate({
        where: { tripId },
        _count: { id: true },
        _sum: { totalPrice: true },
      }),

      // Activities
      Promise.all([
        prisma.activity.count({ where: { tripId } }),
        prisma.activity.groupBy({
          by: ['category'],
          where: { tripId },
          _count: { id: true },
        }),
        prisma.itineraryActivity.count({
          where: { itinerary: { tripId } }
        }),
      ]),

      // Budget
      prisma.budget.aggregate({
        where: { tripId },
        _sum: { plannedAmount: true, actualAmount: true },
      }),

      // Expenses
      Promise.all([
        prisma.expense.aggregate({
          where: { tripId },
          _count: { id: true },
          _sum: { amount: true },
        }),
        prisma.expense.groupBy({
          by: ['category'],
          where: { tripId },
          _sum: { amount: true },
          _count: { id: true },
        }),
      ]),

      // Documents
      Promise.all([
        prisma.document.count({ where: { tripId } }),
        prisma.document.count({
          where: {
            tripId,
            expiryDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
            }
          }
        }),
      ]),

      // Itinerary
      Promise.all([
        prisma.itinerary.count({ where: { tripId } }),
        prisma.itineraryActivity.count({
          where: { itinerary: { tripId } }
        }),
      ]),

      // Photos
      Promise.all([
        prisma.photo.count({ where: { tripId } }),
        prisma.photo.count({
          where: {
            tripId,
            latitude: { not: null },
            longitude: { not: null },
          }
        }),
      ]),

      // Notes
      Promise.all([
        prisma.tripNote.count({ where: { tripId } }),
        prisma.tripNote.groupBy({
          by: ['type'],
          where: { tripId },
          _count: { id: true },
        }),
      ]),

      // Trip details with counts
      prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          _count: {
            select: {
              transportation: true,
              accommodation: true,
              activities: true,
              budget: true,
              expenses: true,
              documents: true,
              itineraries: true,
              photos: true,
              notes: true,
            }
          }
        }
      })
    ]);

    // Calculate trip duration
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilTrip = Math.ceil((startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    // Calculate completion percentage
    const modules = [
      { name: 'transportation', count: transportationStats._count.id, target: 2 },
      { name: 'accommodation', count: accommodationStats._count.id, target: 1 },
      { name: 'activities', count: activityStats[0], target: 5 },
      { name: 'budget', count: budgetStats._sum.plannedAmount ? 1 : 0, target: 1 },
      { name: 'documents', count: documentStats[0], target: 3 },
      { name: 'itinerary', count: itineraryStats[0], target: Math.max(1, Math.floor(duration / 2)) },
      { name: 'photos', count: photoStats[0], target: 1 },
      { name: 'notes', count: noteStats[0], target: 1 },
    ];

    const completionPercentage = Math.round(
      (modules.reduce((acc, module) => acc + Math.min(1, module.count / module.target), 0) / modules.length) * 100
    );

    // Build response
    const dashboard = {
      trip: {
        ...trip,
        duration,
        daysUntilTrip,
        completionPercentage,
      },
      overview: {
        transportation: {
          count: transportationStats._count.id,
          totalCost: Number(transportationStats._sum.price) || 0,
        },
        accommodation: {
          count: accommodationStats._count.id,
          totalCost: Number(accommodationStats._sum.totalPrice) || 0,
        },
        activities: {
          total: activityStats[0],
          scheduled: activityStats[2],
          byCategory: activityStats[1].map(cat => ({
            category: cat.category,
            count: cat._count.id,
          })),
        },
        budget: {
          planned: Number(budgetStats._sum.plannedAmount) || 0,
          actual: Number(expenseStats[0]._sum.amount) || 0,
          remaining: (Number(budgetStats._sum.plannedAmount) || 0) - (Number(expenseStats[0]._sum.amount) || 0),
        },
        expenses: {
          total: Number(expenseStats[0]._sum.amount) || 0,
          count: expenseStats[0]._count.id,
          byCategory: expenseStats[1].map(cat => ({
            category: cat.category,
            amount: Number(cat._sum.amount) || 0,
            count: cat._count.id,
          })),
        },
        documents: {
          total: documentStats[0],
          expiring: documentStats[1],
        },
        itinerary: {
          days: itineraryStats[0],
          activities: itineraryStats[1],
          plannedDays: duration,
        },
        photos: {
          total: photoStats[0],
          withLocation: photoStats[1],
        },
        notes: {
          total: noteStats[0],
          byType: noteStats[1].map(type => ({
            type: type.type,
            count: type._count.id,
          })),
        },
      },
      modules: modules.map(module => ({
        name: module.name,
        completion: Math.min(100, Math.round((module.count / module.target) * 100)),
        count: module.count,
        target: module.target,
      })),
      recentActivity: {
        // We could add recent activities here if needed
      }
    };

    return NextResponse.json(dashboard);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}