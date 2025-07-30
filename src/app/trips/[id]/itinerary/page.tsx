'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Calendar,
  Plus,
  MapPin,
  Clock,
  Loader2,
  Edit,
  Trash2
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
  startDate: string;
  endDate: string;
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
  activityId: string;
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
}

export default function ItineraryPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch trip and itineraries
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

        // Fetch itineraries
        const itinerariesResponse = await fetch(`/api/trips/${params.id}/itinerary`);
        if (!itinerariesResponse.ok) {
          throw new Error('Error al cargar itinerarios');
        }
        const itinerariesData = await itinerariesResponse.json();
        setItineraries(itinerariesData.itineraries || []);
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
  }, [params.id, session, toast]);

  // Authentication checks
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/auth/signin');
    return null;
  }

  // Generate all trip days
  const getTripDays = () => {
    if (!trip) return [];
    
    const days = [];
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    
    return days;
  };

  // Create itinerary for a day
  const handleCreateItinerary = async (date: Date) => {
    try {
      const response = await fetch(`/api/trips/${params.id}/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: date.toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear itinerario');
      }

      const newItinerary = await response.json();
      setItineraries(prev => [...prev, newItinerary].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
      
      toast({
        title: 'Éxito',
        description: 'Itinerario creado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear itinerario',
        variant: 'destructive',
      });
    }
  };

  // Format date
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    // If it's already in HH:MM format, return as is
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      return timeString;
    }
    // Otherwise, try to parse as date
    return new Date(timeString).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if itinerary exists for date
  const getItineraryForDate = (date: Date) => {
    return itineraries.find(itinerary => {
      const itineraryDate = new Date(itinerary.date);
      return itineraryDate.toDateString() === date.toDateString();
    });
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

  const tripDays = getTripDays();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/trips/${trip.id}`)}
            className="hover:bg-gray-50 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Itinerario - {trip.name}</h1>
            <p className="text-gray-600 mt-1">{trip.destination}</p>
          </div>
        </div>

        {/* Trip Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Resumen del Viaje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-400">Duración</p>
                <p className="font-semibold text-gray-600">
                  {tripDays.length} días
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Itinerarios creados</p>
                <p className="font-semibold text-gray-600">
                  {itineraries.length} de {tripDays.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total actividades</p>
                <p className="font-semibold text-gray-600">
                  {itineraries.reduce((sum, it) => sum + it.activities.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Itinerary Days */}
        <div className="space-y-6">
          {tripDays.map((day, index) => {
            const itinerary = getItineraryForDate(day);
            
            return (
              <Card key={day.toISOString()} className="overflow-hidden">
                <CardHeader className="bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-black font-semibold">
                        Día {index + 1} - {formatDate(day)}
                      </CardTitle>
                      {itinerary && (
                        <CardDescription className='text-gray-600'>
                          {itinerary.activities.length} actividades programadas
                        </CardDescription>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {itinerary ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/trips/${trip.id}/itinerary/${itinerary.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar día
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleCreateItinerary(day)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Planificar día
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {itinerary ? (
                  <CardContent className="p-6">
                    {itinerary.activities.length === 0 ? (
                      <div className="text-center py-8">
                        <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No hay actividades programadas</p>
                        <Button
                          size="sm"
                          className="mt-3"
                          onClick={() => router.push(`/trips/${trip.id}/itinerary/${itinerary.id}`)}
                        >
                          Agregar actividades
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {itinerary.activities.map((itineraryActivity) => (
                          <div
                            key={itineraryActivity.id}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-shrink-0 w-16 text-center">
                              {itineraryActivity.startTime && (
                                <div className="text-sm font-medium text-gray-900">
                                  {formatTime(itineraryActivity.startTime)}
                                </div>
                              )}
                              {itineraryActivity.endTime && (
                                <div className="text-xs text-gray-500">
                                  {formatTime(itineraryActivity.endTime)}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
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
                                <p className="text-sm text-gray-600 mt-1">
                                  {itineraryActivity.notes}
                                </p>
                              )}
                            </div>

                            {itineraryActivity.activity.price && (
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  {itineraryActivity.activity.price} {itineraryActivity.activity.currency}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {itinerary.notes && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Notas del día</h4>
                        <p className="text-gray-700 text-sm">{itinerary.notes}</p>
                      </div>
                    )}
                  </CardContent>
                ) : (
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Este día aún no ha sido planificado</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}