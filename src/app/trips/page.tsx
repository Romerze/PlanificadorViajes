'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TripForm } from '@/components/trips/trip-form';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Trip {
  id: string;
  name: string;
  destination: string;
  description: string | null;
  startDate: string;
  endDate: string;
  coverImageUrl: string | null;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  _count: {
    activities: number;
    transportation: number;
    accommodation: number;
    photos: number;
  };
}

interface TripsResponse {
  trips: Trip[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const statusColors = {
  PLANNING: 'bg-blue-50 text-blue-700 border-blue-200',
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  COMPLETED: 'bg-gray-50 text-gray-700 border-gray-200',
} as const;

const statusLabels = {
  PLANNING: 'Planificando',
  ACTIVE: 'En Curso',
  COMPLETED: 'Completado',
} as const;

export default function TripsPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Load trips on component mount and when filters change
  useEffect(() => {
    const fetchTrips = async () => {
      if (!session) return;
      
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter) params.append('status', statusFilter);
        
        const response = await fetch(`/api/trips?${params.toString()}`);
        if (!response.ok) throw new Error('Error al cargar viajes');
        
        const data: TripsResponse = await response.json();
        setTrips(data.trips);
        
        // Calculate stats
        const tripsStats = {
          total: data.trips.length,
          planning: data.trips.filter(t => t.status === 'PLANNING').length,
          active: data.trips.filter(t => t.status === 'ACTIVE').length,
          completed: data.trips.filter(t => t.status === 'COMPLETED').length,
          totalActivities: data.trips.reduce((acc, trip) => acc + trip._count.activities, 0),
          totalPhotos: data.trips.reduce((acc, trip) => acc + trip._count.photos, 0),
          nextTrip: data.trips
            .filter(t => t.status === 'PLANNING' && new Date(t.startDate) > new Date())
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0],
        };
        setStats(tripsStats);
      } catch (error) {
        console.error('Error fetching trips:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los viajes',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [searchTerm, statusFilter, session, toast]);

  // Redirect if not authenticated
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/auth/signin');
    return null;
  }

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
      setTrips(prev => [newTrip, ...prev]);
      setShowCreateForm(false);
      
      toast({
        title: 'Éxito',
        description: 'Viaje creado exitosamente',
      });
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

  // Update trip
  const handleUpdateTrip = async (data: any) => {
    if (!editingTrip) return;
    
    setFormLoading(true);
    try {
      const response = await fetch(`/api/trips/${editingTrip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar viaje');
      }

      const updatedTrip = await response.json();
      setTrips(prev => prev.map(trip => 
        trip.id === editingTrip.id ? updatedTrip : trip
      ));
      setEditingTrip(null);
      
      toast({
        title: 'Éxito',
        description: 'Viaje actualizado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar viaje',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Delete trip
  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este viaje?')) return;
    
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar viaje');
      }

      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      
      toast({
        title: 'Éxito',
        description: 'Viaje eliminado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar viaje',
        variant: 'destructive',
      });
    }
  };

  // Duplicate trip
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al duplicar viaje');
      }

      const newTrip = await response.json();
      setTrips(prev => [newTrip, ...prev]);
      
      toast({
        title: 'Éxito',
        description: 'Viaje duplicado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al duplicar viaje',
        variant: 'destructive',
      });
    }
  };

  // View trip details
  const handleViewTrip = (tripId: string) => {
    window.location.href = `/trips/${tripId}`;
  };

  // Calculate trip duration
  const getTripDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Viajes</h1>
            <p className="text-gray-600 mt-1">
              Gestiona y organiza todas tus aventuras
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-black text-white hover:bg-white hover:text-black border border-black"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Viaje
          </Button>
        </div>

        {/* Stats Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Total Viajes</p>
                    <p className="text-2xl font-bold text-gray-500">{stats.total}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">En Planificación</p>
                    <p className="text-2xl font-bold text-blue-500">{stats.planning}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Actividades Totales</p>
                    <p className="text-2xl font-bold text-green-500">{stats.totalActivities}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Fotos Subidas</p>
                    <p className="text-2xl font-bold text-purple-500">{stats.totalPhotos}</p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Next Trip Alert */}
        {stats?.nextTrip && (
          <Card className="mb-6 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    🎉 Próximo viaje: {stats.nextTrip.name}
                  </h3>
                  <p className="text-gray-600">
                    {stats.nextTrip.destination} • {formatDate(stats.nextTrip.startDate)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewTrip(stats.nextTrip.id)}
                >
                  Ver detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar viajes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="PLANNING">Planificando</option>
            <option value="ACTIVE">En Curso</option>
            <option value="COMPLETED">Completado</option>
          </select>
        </div>

        {/* Trips Grid */}
        {trips.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">
                No hay viajes aún
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza a planificar tu próxima aventura
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-black text-white hover:bg-white hover:text-black border border-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear mi primer viaje
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Card 
                key={trip.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                onClick={() => handleViewTrip(trip.id)}
              >
                {/* Cover Image */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 relative">
                  {trip.coverImageUrl ? (
                    <img
                      src={trip.coverImageUrl}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                      <MapPin className="h-12 w-12 text-white/80" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  
                  {/* Status Badge */}
                  <Badge
                    className={`absolute top-3 left-3 ${statusColors[trip.status]} shadow-md hover:text-white`}
                  >
                    {statusLabels[trip.status]}
                  </Badge>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-3 right-3 h-8 w-8 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewTrip(trip.id); }}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingTrip(trip); }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicateTrip(trip); }}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-400 mb-2">
                    {trip.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{trip.destination}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      ({getTripDuration(trip.startDate, trip.endDate)} días)
                    </span>
                  </div>

                  {trip.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {trip.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>
                      <span className="font-semibold text-gray-400">{trip._count.activities}</span> actividades
                    </div>
                    <div>
                      <span className="font-semibold text-gray-400">{trip._count.transportation}</span> transportes
                    </div>
                    <div>
                      <span className="font-semibold text-gray-400">{trip._count.accommodation}</span> hospedajes
                    </div>
                    <div>
                      <span className="font-semibold text-gray-400">{trip._count.photos}</span> fotos
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Trip Dialog */}
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

      {/* Edit Trip Dialog */}
      <Dialog open={!!editingTrip} onOpenChange={() => setEditingTrip(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {editingTrip && (
            <TripForm
              initialData={{
                ...editingTrip,
                description: editingTrip.description || undefined,
                coverImageUrl: editingTrip.coverImageUrl || undefined
              }}
              onSubmit={handleUpdateTrip}
              onCancel={() => setEditingTrip(null)}
              isLoading={formLoading}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}