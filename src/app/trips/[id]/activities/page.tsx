'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Plus,
  Search,
  MapPin,
  Euro,
  Clock,
  Loader2,
  Edit,
  Trash2,
  Star,
  Globe,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ActivityForm } from '@/components/activities/activity-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Trip {
  id: string;
  name: string;
  destination: string;
}

interface Activity {
  id: string;
  name: string;
  category: string;
  address?: string;
  price?: number;
  currency?: string;
  durationHours?: number;
  openingHours?: string;
  websiteUrl?: string;
  phone?: string;
  notes?: string;
  rating?: number;
  _count: {
    itineraryActivities: number;
    photos: number;
  };
}

const activityCategories = [
  { value: 'CULTURAL', label: 'Cultural' },
  { value: 'FOOD', label: 'Gastronomía' },
  { value: 'NATURE', label: 'Naturaleza' },
  { value: 'ADVENTURE', label: 'Aventura' },
  { value: 'SHOPPING', label: 'Compras' },
  { value: 'ENTERTAINMENT', label: 'Entretenimiento' },
  { value: 'OTHER', label: 'Otro' },
];

export default function ActivitiesPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;
      
      try {
        // Fetch trip details
        const tripResponse = await fetch(`/api/trips/${params.id}`);
        if (!tripResponse.ok) {
          throw new Error('Error al cargar el viaje');
        }
        const tripData = await tripResponse.json();
        setTrip(tripData);

        // Fetch activities
        const params_url = new URLSearchParams();
        if (searchTerm) params_url.append('search', searchTerm);
        if (categoryFilter && categoryFilter !== 'all') params_url.append('category', categoryFilter);
        
        const activitiesResponse = await fetch(`/api/trips/${params.id}/activities?${params_url.toString()}`);
        if (!activitiesResponse.ok) {
          throw new Error('Error al cargar actividades');
        }
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData.activities || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, session, toast, searchTerm, categoryFilter]);

  // Authentication checks
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/auth/signin');
    return null;
  }

  // Create activity
  const handleCreateActivity = async (data: any) => {
    setFormLoading(true);
    try {
      const response = await fetch(`/api/trips/${params.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear actividad');
      }

      const newActivity = await response.json();
      setActivities(prev => [newActivity, ...prev]);
      setShowCreateForm(false);
      
      toast({
        title: 'Éxito',
        description: 'Actividad creada exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear actividad',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Update activity
  const handleUpdateActivity = async (data: any) => {
    if (!editingActivity) return;
    
    setFormLoading(true);
    try {
      const response = await fetch(`/api/trips/${params.id}/activities/${editingActivity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar actividad');
      }

      const updatedActivity = await response.json();
      setActivities(prev => prev.map(activity => 
        activity.id === editingActivity.id ? updatedActivity : activity
      ));
      setEditingActivity(null);
      
      toast({
        title: 'Éxito',
        description: 'Actividad actualizada exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar actividad',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Delete activity
  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta actividad?')) return;
    
    try {
      const response = await fetch(`/api/trips/${params.id}/activities/${activityId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar actividad');
      }

      setActivities(prev => prev.filter(activity => activity.id !== activityId));
      
      toast({
        title: 'Éxito',
        description: 'Actividad eliminada exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar actividad',
        variant: 'destructive',
      });
    }
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    return activityCategories.find(cat => cat.value === category)?.label || category;
  };

  // Format price
  const formatPrice = (price: number | string, currency: string) => {
    const numPrice = typeof price === 'number' ? price : parseFloat(price.toString());
    return `${currency} ${numPrice.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="hover:bg-gray-50 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Actividades</h1>
            <p className="text-gray-600 mt-1">{trip.name} - {trip.destination}</p>
          </div>

          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Actividad
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar actividades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {activityCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Activities Grid */}
        {activities.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">
                No hay actividades aún
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza agregando actividades para tu viaje
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear primera actividad
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-300 mb-2">
                        {activity.name}
                      </CardTitle>
                      <Badge variant="secondary" className="mb-2">
                        {getCategoryLabel(activity.category)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingActivity(activity)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {activity.address && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{activity.address}</span>
                    </div>
                  )}

                  {activity.price && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Euro className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{formatPrice(activity.price, activity.currency || 'PEN')}</span>
                    </div>
                  )}

                  {activity.durationHours && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{activity.durationHours} horas</span>
                    </div>
                  )}

                  {activity.rating && (
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < activity.rating!
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-400 ml-1">({activity.rating}/5)</span>
                    </div>
                  )}

                  {activity.notes && (
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {activity.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-4 pt-2 text-xs text-gray-500">
                    <span>En {activity._count.itineraryActivities} itinerarios</span>
                    <span>{activity._count.photos} fotos</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    {activity.websiteUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={activity.websiteUrl} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-3 w-3 mr-1" />
                          Web
                        </a>
                      </Button>
                    )}
                    {activity.phone && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={`tel:${activity.phone}`}>
                          <Phone className="h-3 w-3 mr-1" />
                          Llamar
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Activity Dialog */}
      <Dialog open={showCreateForm || !!editingActivity} onOpenChange={(open) => {
        if (!open) {
          setShowCreateForm(false);
          setEditingActivity(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}
            </DialogTitle>
          </DialogHeader>
          <ActivityForm
            initialData={editingActivity || undefined}
            onSubmit={editingActivity ? handleUpdateActivity : handleCreateActivity}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingActivity(null);
            }}
            isLoading={formLoading}
            mode={editingActivity ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}