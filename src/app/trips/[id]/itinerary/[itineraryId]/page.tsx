'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Calendar,
  Plus,
  MapPin,
  Clock,
  Loader2,
  Edit,
  Trash2,
  GripVertical,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
}

interface ItineraryActivity {
  id: string;
  startTime?: string;
  endTime?: string;
  order: number;
  notes?: string;
  activity: Activity;
}

interface Itinerary {
  id: string;
  date: string;
  notes?: string;
  activities: ItineraryActivity[];
  _count: {
    activities: number;
    photos: number;
  };
}

interface TripActivity {
  id: string;
  name: string;
  category: string;
  address?: string;
  price?: number;
  currency?: string;
}

export default function ItineraryDayPage({ 
  params 
}: { 
  params: { id: string; itineraryId: string } 
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [tripActivities, setTripActivities] = useState<TripActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [editingActivity, setEditingActivity] = useState<ItineraryActivity | null>(null);
  const [editingStartTime, setEditingStartTime] = useState('');
  const [editingEndTime, setEditingEndTime] = useState('');
  const [editingActivityNotes, setEditingActivityNotes] = useState('');

  // Refresh activities
  const refreshActivities = async () => {
    try {
      const activitiesResponse = await fetch(`/api/trips/${params.id}/activities`);
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setTripActivities(activitiesData.activities || []);
      }
    } catch (error) {
      console.error('Error refreshing activities:', error);
    }
  };

  // Auto-refresh activities when page gains focus (user returns from activities page)
  useEffect(() => {
    const handleFocus = () => {
      refreshActivities();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Fetch data
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

        // Fetch itinerary
        const itineraryResponse = await fetch(`/api/trips/${params.id}/itineraries/${params.itineraryId}`);
        if (!itineraryResponse.ok) {
          throw new Error('Error al cargar itinerario');
        }
        const itineraryData = await itineraryResponse.json();
        setItinerary(itineraryData);
        setNotes(itineraryData.notes || '');

        // Fetch all trip activities for adding to itinerary
        const activitiesResponse = await fetch(`/api/trips/${params.id}/activities`);
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          setTripActivities(activitiesData.activities || []);
        }
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
  }, [params.id, params.itineraryId, session, toast]);

  // Authentication checks
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/auth/signin');
    return null;
  }

  // Save itinerary notes
  const handleSaveNotes = async () => {
    if (!itinerary) return;

    try {
      const response = await fetch(`/api/trips/${params.id}/itineraries/${params.itineraryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar notas');
      }

      const updatedItinerary = await response.json();
      setItinerary(updatedItinerary);
      setEditingNotes(false);
      
      toast({
        title: 'Éxito',
        description: 'Notas actualizadas exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar notas',
        variant: 'destructive',
      });
    }
  };

  // Add activity to itinerary
  const handleAddActivity = async (activityId: string) => {
    try {
      const response = await fetch(`/api/trips/${params.id}/itineraries/${params.itineraryId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al agregar actividad');
      }

      // Refresh itinerary
      const itineraryResponse = await fetch(`/api/trips/${params.id}/itineraries/${params.itineraryId}`);
      if (itineraryResponse.ok) {
        const itineraryData = await itineraryResponse.json();
        setItinerary(itineraryData);
      }

      setShowAddActivity(false);
      
      toast({
        title: 'Éxito',
        description: 'Actividad agregada al itinerario',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al agregar actividad',
        variant: 'destructive',
      });
    }
  };

  // Start editing itinerary activity
  const handleEditItineraryActivity = (itineraryActivity: ItineraryActivity) => {
    setEditingActivity(itineraryActivity);
    setEditingStartTime(itineraryActivity.startTime ? 
      new Date(itineraryActivity.startTime).toISOString().slice(0, 16) : '');
    setEditingEndTime(itineraryActivity.endTime ? 
      new Date(itineraryActivity.endTime).toISOString().slice(0, 16) : '');
    setEditingActivityNotes(itineraryActivity.notes || '');
  };

  // Update itinerary activity
  const handleUpdateItineraryActivity = async () => {
    if (!editingActivity) return;

    try {
      const updateData: any = {};
      
      if (editingStartTime) {
        updateData.startTime = new Date(editingStartTime).toISOString();
      }
      if (editingEndTime) {
        updateData.endTime = new Date(editingEndTime).toISOString();
      }
      if (editingActivityNotes !== editingActivity.notes) {
        updateData.notes = editingActivityNotes;
      }

      // Validate time range
      if (editingStartTime && editingEndTime) {
        const start = new Date(editingStartTime);
        const end = new Date(editingEndTime);
        if (start >= end) {
          toast({
            title: 'Error',
            description: 'La hora de inicio debe ser anterior a la hora de fin',
            variant: 'destructive',
          });
          return;
        }
      }

      const response = await fetch(`/api/trips/${params.id}/itineraries/${params.itineraryId}/activities/${editingActivity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar actividad del itinerario');
      }

      // Refresh itinerary
      const itineraryResponse = await fetch(`/api/trips/${params.id}/itineraries/${params.itineraryId}`);
      if (itineraryResponse.ok) {
        const itineraryData = await itineraryResponse.json();
        setItinerary(itineraryData);
      }

      setEditingActivity(null);
      setEditingStartTime('');
      setEditingEndTime('');
      setEditingActivityNotes('');
      
      toast({
        title: 'Éxito',
        description: 'Actividad del itinerario actualizada',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar actividad del itinerario',
        variant: 'destructive',
      });
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingActivity(null);
    setEditingStartTime('');
    setEditingEndTime('');
    setEditingActivityNotes('');
  };

  // Remove activity from itinerary
  const handleRemoveActivity = async (activityId: string) => {
    try {
      const response = await fetch(`/api/trips/${params.id}/itineraries/${params.itineraryId}/activities/${activityId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar actividad');
      }

      // Refresh itinerary
      const itineraryResponse = await fetch(`/api/trips/${params.id}/itineraries/${params.itineraryId}`);
      if (itineraryResponse.ok) {
        const itineraryData = await itineraryResponse.json();
        setItinerary(itineraryData);
      }
      
      toast({
        title: 'Éxito',
        description: 'Actividad eliminada del itinerario',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar actividad',
        variant: 'destructive',
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get available activities (not already in itinerary)
  const getAvailableActivities = () => {
    if (!itinerary) return tripActivities;
    
    const itineraryActivityIds = itinerary.activities.map(ia => ia.activity.id);
    return tripActivities.filter(activity => !itineraryActivityIds.includes(activity.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!trip || !itinerary) {
    return null;
  }

  const availableActivities = getAvailableActivities();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/trips/${trip.id}/itinerary`)}
            className="hover:bg-gray-50 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al itinerario
          </Button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {formatDate(itinerary.date)}
            </h1>
            <p className="text-gray-600 mt-1">{trip.name} - {trip.destination}</p>
          </div>
        </div>

        {/* Day Activities */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Actividades del Día
                </CardTitle>
                <CardDescription>
                  {itinerary.activities.length} actividades programadas
                </CardDescription>
              </div>
              
              <Button
                onClick={() => setShowAddActivity(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar actividad
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {itinerary.activities.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No hay actividades programadas
                </h3>
                <p className="text-gray-600 mb-6">
                  Comienza agregando actividades a este día
                </p>
                <Button
                  onClick={() => setShowAddActivity(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar primera actividad
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {itinerary.activities.map((itineraryActivity, index) => (
                  <div
                    key={itineraryActivity.id}
                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div className="flex-shrink-0">
                      <GripVertical className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <div className="flex-shrink-0 w-20 text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {index + 1}
                      </div>
                      {itineraryActivity.startTime && (
                        <div className="text-sm text-gray-600">
                          {formatTime(itineraryActivity.startTime)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {itineraryActivity.activity.name}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {itineraryActivity.activity.category}
                        </Badge>
                        {itineraryActivity.activity.address && (
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {itineraryActivity.activity.address}
                          </span>
                        )}
                      </div>
                      {itineraryActivity.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          {itineraryActivity.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {itineraryActivity.activity.price && (
                        <div className="text-right mr-4">
                          <div className="text-sm font-medium text-gray-900">
                            {itineraryActivity.activity.price} {itineraryActivity.activity.currency}
                          </div>
                        </div>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditItineraryActivity(itineraryActivity)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveActivity(itineraryActivity.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Day Notes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Notas del Día</CardTitle>
              {!editingNotes ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingNotes(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingNotes(false);
                      setNotes(itinerary.notes || '');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingNotes ? (
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agrega notas para este día..."
                className="min-h-32"
              />
            ) : (
              <div className="min-h-32">
                {itinerary.notes ? (
                  <p className="text-gray-700 whitespace-pre-wrap">{itinerary.notes}</p>
                ) : (
                  <p className="text-gray-500 italic">No hay notas para este día</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Activity Dialog */}
        <Dialog open={showAddActivity} onOpenChange={setShowAddActivity}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Agregar Actividad al Itinerario</DialogTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={refreshActivities}
                >
                  Actualizar
                </Button>
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              {availableActivities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    No hay más actividades disponibles para agregar
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => router.push(`/trips/${trip.id}/activities`)}
                    >
                      Gestionar actividades
                    </Button>
                    <Button
                      variant="outline"
                      onClick={refreshActivities}
                    >
                      Actualizar lista
                    </Button>
                  </div>
                </div>
              ) : (
                availableActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <h4 className="font-medium text-gray-400 hover:text-black">{activity.name}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {activity.category}
                        </Badge>
                        {activity.address && (
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {activity.address}
                          </span>
                        )}
                        {activity.price && (
                          <span className="text-sm text-gray-600">
                            {activity.price} {activity.currency}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleAddActivity(activity.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Itinerary Activity Dialog */}
        <Dialog open={!!editingActivity} onOpenChange={(open) => {
          if (!open) handleCancelEdit();
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Actividad del Itinerario</DialogTitle>
            </DialogHeader>
            
            {editingActivity && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-400 mb-2">
                    {editingActivity.activity.name}
                  </h4>
                  <Badge variant="secondary">
                    {editingActivity.activity.category}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Hora de inicio</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={editingStartTime}
                      onChange={(e) => setEditingStartTime(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Hora de fin</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={editingEndTime}
                      onChange={(e) => setEditingEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activityNotes">Notas</Label>
                  <Textarea
                    id="activityNotes"
                    value={editingActivityNotes}
                    onChange={(e) => setEditingActivityNotes(e.target.value)}
                    placeholder="Notas específicas para esta actividad en el itinerario..."
                    className="min-h-20"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdateItineraryActivity}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}