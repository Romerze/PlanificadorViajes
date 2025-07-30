'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { TripForm } from '@/components/trips/trip-form';
import { Plus, MapPin, Calendar, Globe, ArrowRight, Loader2, Eye, Edit, Trash2, Copy, MoreHorizontal, Plane, Camera, FileText, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Trip {
  id: string;
  name: string;
  destination: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
  coverImageUrl: string | null;
  _count: {
    activities: number;
    transportation: number;
    accommodation: number;
    photos: number;
    documents: number;
    notes: number;
  };
}

interface DashboardStats {
  totalTrips: number;
  planning: number;
  active: number;
  completed: number;
  totalActivities: number;
  totalPhotos: number;
  totalDocuments: number;
  nextTrip: Trip | null;
  recentTrips: Trip[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Load dashboard data
  const fetchDashboardData = async () => {
    if (!session) return;
    
    try {
      const response = await fetch('/api/trips');
      if (!response.ok) throw new Error('Error al cargar datos');
      
      const data = await response.json();
      const tripsList = data.trips || [];
      setTrips(tripsList);
      
      // Calculate stats
      const dashboardStats: DashboardStats = {
        totalTrips: tripsList.length,
        planning: tripsList.filter((t: Trip) => t.status === 'PLANNING').length,
        active: tripsList.filter((t: Trip) => t.status === 'ACTIVE').length,
        completed: tripsList.filter((t: Trip) => t.status === 'COMPLETED').length,
        totalActivities: tripsList.reduce((acc: number, trip: Trip) => acc + trip._count.activities, 0),
        totalPhotos: tripsList.reduce((acc: number, trip: Trip) => acc + trip._count.photos, 0),
        totalDocuments: tripsList.reduce((acc: number, trip: Trip) => acc + trip._count.documents, 0),
        nextTrip: tripsList
          .filter((t: Trip) => t.status === 'PLANNING' && new Date(t.startDate) > new Date())
          .sort((a: Trip, b: Trip) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0] || null,
        recentTrips: tripsList.slice(0, 4)
      };
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
    fetchDashboardData();
  }, [session, toast]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/auth/signin');
    return null;
  }

  // Event handlers
  const handleNewTrip = () => {
    setShowCreateForm(true);
  };

  // Create trip
  const handleCreateTrip = async (data: any) => {
    setFormLoading(true);
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear viaje');
      }

      const newTrip = await response.json();
      setShowCreateForm(false);
      
      toast({
        title: 'Éxito',
        description: 'Viaje creado exitosamente',
      });

      // Navigate to the new trip
      router.push(`/trips/${newTrip.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear viaje',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewTrip = (tripId: string) => {
    router.push(`/trips/${tripId}`);
  };

  const handleEditTrip = (tripId: string) => {
    router.push(`/trips/${tripId}`);
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este viaje?')) return;
    
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar viaje');

      toast({
        title: 'Éxito',
        description: 'Viaje eliminado exitosamente',
      });

      // Refresh data
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar viaje',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateTrip = async (trip: Trip) => {
    try {
      const duplicateData = {
        name: `${trip.name} (Copia)`,
        destination: trip.destination,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        coverImageUrl: trip.coverImageUrl,
      };

      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData),
      });

      if (!response.ok) throw new Error('Error al duplicar viaje');

      toast({
        title: 'Éxito',
        description: 'Viaje duplicado exitosamente',
      });

      // Refresh data
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al duplicar viaje',
        variant: 'destructive',
      });
    }
  };

  const handleViewAllTrips = () => {
    router.push('/trips');
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTripDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 relative">
      {/* Nature Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-green-200/20 to-emerald-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-16 w-80 h-80 bg-gradient-to-tl from-blue-200/20 to-sky-300/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-br from-teal-200/15 to-cyan-300/25 rounded-full blur-2xl" />
      </div>
      
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl relative z-10">
        <div className="mb-12 sm:mb-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
                ¡Hola, {session.user?.name?.split(' ')[0]}! 🏔️
              </h1>
              <p className="text-base sm:text-lg text-slate-600">
                {stats?.totalTrips ? `Tienes ${stats.totalTrips} aventuras planeadas` : 'Es hora de planificar tu primera gran aventura'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button 
                variant="outline"
                onClick={handleViewAllTrips}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-black"
              >
                Ver todas las aventuras
              </Button>
              <Button 
                onClick={handleNewTrip}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Aventura
              </Button>
            </div>
          </div>
        </div>

        {stats && (
          <div className="mb-12 sm:mb-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-white/60 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-200 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Plane className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">{stats.totalTrips}</div>
                  <div className="text-xs sm:text-sm text-slate-600">Aventuras</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-white/60 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-200 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="h-6 w-6 text-teal-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">{stats.totalActivities}</div>
                  <div className="text-xs sm:text-sm text-slate-600">Experiencias</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-white/60 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-200 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-sky-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Camera className="h-6 w-6 text-sky-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">{stats.totalPhotos}</div>
                  <div className="text-xs sm:text-sm text-slate-600">Recuerdos</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-white/60 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-200 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">{stats.totalDocuments}</div>
                  <div className="text-xs sm:text-sm text-slate-600">Documentos</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {stats?.nextTrip && (
          <Card className="mb-12 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border-emerald-200/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                      Próxima aventura: {stats.nextTrip.name}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600">
                      {stats.nextTrip.destination} • {formatDate(stats.nextTrip.startDate)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewTrip(stats.nextTrip!.id)}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 w-full sm:w-auto"
                >
                  Explorar detalles
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Aventuras recientes</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleViewAllTrips}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-black"
            >
              Ver todas
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          {trips.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-white/60 shadow-xl">
              <CardContent className="text-center py-12 sm:py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3">
                  ¡Tu primera aventura te espera!
                </h3>
                <p className="text-sm sm:text-base text-slate-600 mb-8 px-4 max-w-md mx-auto">
                  Comienza a planificar tu próxima gran aventura y descubre destinos increíbles
                </p>
                <Button 
                  onClick={handleNewTrip} 
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear mi primera aventura
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {stats?.recentTrips.map((trip) => (
                <Card key={trip.id} className="bg-white/80 backdrop-blur-sm border-white/60 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-200 cursor-pointer group hover:-translate-y-1" onClick={() => handleViewTrip(trip.id)}>
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gray-400 from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-slate-200" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base group-hover:text-blue-700 transition-colors">{trip.name}</h3>
                            <p className="text-xs sm:text-sm text-slate-600">{trip.destination}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 ml-13">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                          <span className="text-slate-400">•</span>
                          <span>{getTripDuration(trip.startDate, trip.endDate)} días</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(trip.status)} text-xs border-0 hover:text-white`}>
                          {getStatusLabel(trip.status)}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <TripForm
              onSubmit={handleCreateTrip}
              onCancel={() => setShowCreateForm(false)}
              isLoading={formLoading}
              mode="create"
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
