'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  MapPin, 
  Calendar, 
  Clock,
  Edit,
  Loader2,
  Plane,
  Building,
  DollarSign,
  Files,
  Camera,
  FileText,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StatsWidget } from '@/components/dashboard/stats-widget';
import { ModuleProgress } from '@/components/dashboard/module-progress';
import { FinancialSummary } from '@/components/dashboard/financial-summary';
import { EditTripModal } from '@/components/trips/edit-trip-modal';

interface DashboardData {
  trip: {
    id: string;
    name: string;
    destination: string;
    description: string | null;
    startDate: string;
    endDate: string;
    coverImageUrl: string | null;
    status: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
    duration: number;
    daysUntilTrip: number;
    completionPercentage: number;
  };
  overview: {
    transportation: {
      count: number;
      totalCost: number;
    };
    accommodation: {
      count: number;
      totalCost: number;
    };
    activities: {
      total: number;
      scheduled: number;
      byCategory: Array<{
        category: string;
        count: number;
      }>;
    };
    budget: {
      planned: number;
      actual: number;
      remaining: number;
    };
    expenses: {
      total: number;
      count: number;
      byCategory: Array<{
        category: string;
        amount: number;
        count: number;
      }>;
    };
    documents: {
      total: number;
      expiring: number;
    };
    itinerary: {
      days: number;
      activities: number;
      plannedDays: number;
    };
    photos: {
      total: number;
      withLocation: number;
    };
    notes: {
      total: number;
      byType: Array<{
        type: string;
        count: number;
      }>;
    };
  };
  modules: Array<{
    name: string;
    completion: number;
    count: number;
    target: number;
  }>;
}

export default function TripDashboard({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load dashboard data
  const fetchDashboard = async () => {
    if (!session) return;
    
    try {
      const response = await fetch(`/api/trips/${params.id}/dashboard`);
      if (!response.ok) {
        throw new Error('Error al cargar datos del dashboard');
      }
      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [params.id, session, toast]);

  // Authentication checks
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/auth/signin');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const { trip, overview, modules } = dashboard;

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return 'bg-blue-100 text-blue-700';
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return 'Planificando';
      case 'ACTIVE':
        return 'En curso';
      case 'COMPLETED':
        return 'Completado';
      default:
        return status;
    }
  };

  const getDaysUntilTripText = () => {
    if (trip.daysUntilTrip < 0) {
      return `Hace ${Math.abs(trip.daysUntilTrip)} días`;
    } else if (trip.daysUntilTrip === 0) {
      return '¡Hoy!';
    } else if (trip.daysUntilTrip === 1) {
      return '¡Mañana!';
    } else {
      return `En ${trip.daysUntilTrip} días`;
    }
  };

  const handleNavigateToModule = (moduleName: string) => {
    router.push(`/trips/${params.id}/${moduleName}`);
  };

  const handleTripUpdate = (updatedTrip: any) => {
    // Update the trip data in the dashboard
    setDashboard(prev => {
      if (!prev) return null;
      return {
        ...prev,
        trip: {
          ...prev.trip,
          ...updatedTrip,
        }
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/trips')}
            className="hover:bg-gray-50 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{trip.name}</h1>
              <Badge className={getStatusColor(trip.status)} >
                {getStatusLabel(trip.status)}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {trip.destination}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {trip.duration} días
              </span>
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar viaje
          </Button>
        </div>

        {/* Trip Status Banner */}
        <Card className="mb-8 border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-400 mb-1">
                  {trip.status === 'PLANNING' && getDaysUntilTripText()}
                  {trip.status === 'ACTIVE' && '¡Tu viaje está en curso!'}
                  {trip.status === 'COMPLETED' && '¡Viaje completado!'}
                </h3>
                <p className="text-gray-500">
                  {trip.status === 'PLANNING' && 'Completa tu planificación para estar 100% listo'}
                  {trip.status === 'ACTIVE' && 'Disfruta cada momento de tu aventura'}
                  {trip.status === 'COMPLETED' && 'Esperamos que hayas tenido un viaje increíble'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {trip.completionPercentage}%
                </div>
                <div className="text-sm text-gray-600">Completitud</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsWidget
            title="Actividades"
            value={overview.activities.total}
            description={`${overview.activities.scheduled} programadas`}
            icon={MapPin}
            color="purple"
            progress={{
              value: overview.activities.scheduled,
              max: overview.activities.total || 1,
              label: "Programadas"
            }}
          />

          <StatsWidget
            title="Presupuesto"
            value={`S/ ${(overview.budget.planned || 0).toLocaleString()}`}
            description={`S/ ${(overview.budget.actual || 0).toLocaleString()} gastado`}
            icon={DollarSign}
            color="green"
            progress={{
              value: overview.budget.actual || 0,
              max: overview.budget.planned || 1,
              label: "Usado"
            }}
          />

          <StatsWidget
            title="Documentos"
            value={overview.documents.total}
            description={`${overview.documents.expiring} por vencer`}
            icon={Files}
            color="red"
            badge={overview.documents.expiring > 0 ? {
              text: `${overview.documents.expiring} vencen pronto`,
              variant: 'destructive'
            } : undefined}
          />

          <StatsWidget
            title="Fotos"
            value={overview.photos.total}
            description={`${overview.photos.withLocation} con ubicación`}
            icon={Camera}
            color="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Progress and Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Module Progress */}
            <ModuleProgress 
              modules={modules} 
              onNavigate={handleNavigateToModule}
            />

            {/* Financial Summary */}
            <FinancialSummary 
              data={{
                budget: overview.budget,
                expenses: overview.expenses,
                transportation: overview.transportation,
                accommodation: overview.accommodation,
              }}
            />
          </div>

          {/* Right Column - Quick Actions and Summary */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones rápidas</CardTitle>
                <CardDescription>
                  Accede directamente a cada módulo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push(`/trips/${trip.id}/transportation`)}
                  >
                    <Plane className="h-4 w-4 mr-2" />
                    Gestionar Transporte
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push(`/trips/${trip.id}/accommodation`)}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Gestionar Hospedaje
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push(`/trips/${trip.id}/activities`)}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Gestionar Actividades
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push(`/trips/${trip.id}/budget`)}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Gestionar Presupuesto
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push(`/trips/${trip.id}/itinerary`)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver Itinerario
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push(`/trips/${trip.id}/documents`)}
                  >
                    <Files className="h-4 w-4 mr-2" />
                    Gestionar Documentos
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push(`/trips/${trip.id}/photos`)}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Galería de Fotos
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push(`/trips/${trip.id}/notes`)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Notas de Viaje
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="space-y-4">
              {/* Itinerary Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Itinerario
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Días planificados</span>
                      <span className="font-medium">{overview.itinerary.days}/{overview.itinerary.plannedDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Actividades programadas</span>
                      <span className="font-medium">{overview.itinerary.activities}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes Summary */}
              {overview.notes.total > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Notas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total notas</span>
                        <span className="font-medium">{overview.notes.total}</span>
                      </div>
                      {overview.notes.byType.map(type => (
                        <div key={type.type} className="flex justify-between">
                          <span className="text-xs text-gray-500">{type.type}</span>
                          <span className="text-xs">{type.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Edit Trip Modal */}
        {dashboard && (
          <EditTripModal
            trip={dashboard.trip}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={handleTripUpdate}
          />
        )}
      </div>
    </div>
  );
}