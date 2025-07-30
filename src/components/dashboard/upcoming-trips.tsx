'use client';

import React from 'react';
import { Calendar, MapPin, Clock, ArrowRight, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'completed';
  coverImage?: string;
}

interface UpcomingTripsProps {
  trips: Trip[];
  loading?: boolean;
  onViewTrip: (tripId: string) => void;
  onViewAllTrips: () => void;
  onCreateTrip: () => void;
}

export function UpcomingTrips({
  trips,
  loading = false,
  onViewTrip,
  onViewAllTrips,
  onCreateTrip,
}: UpcomingTripsProps) {
  // Filter and sort upcoming trips
  const upcomingTrips = trips
    .filter(trip => trip.status !== 'completed' && trip.startDate >= new Date())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, 3); // Show only first 3

  if (loading) {
    return (
      <Card className="p-6 bg-white border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Próximos Viajes</h3>
          <p className="text-sm text-gray-500">
            {upcomingTrips.length > 0 
              ? `${upcomingTrips.length} viaje${upcomingTrips.length > 1 ? 's' : ''} planificado${upcomingTrips.length > 1 ? 's' : ''}` 
              : 'No hay viajes programados'
            }
          </p>
        </div>
        
        <Button
          size="sm"
          onClick={onViewAllTrips}
          className="bg-black text-white hover:bg-white hover:text-black border border-black"
        >
          Ver todos
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {upcomingTrips.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No hay viajes programados
          </h4>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            ¡Es hora de planificar tu próxima aventura! Crea tu primer viaje y comienza a organizar.
          </p>
          <Button onClick={onCreateTrip} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Crear primer viaje
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingTrips.map((trip) => {
            const daysUntil = formatDistanceToNow(trip.startDate, { 
              addSuffix: true, 
              locale: es 
            });
            const isActive = trip.status === 'active';
            
            return (
              <div
                key={trip.id}
                className="group flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer"
                onClick={() => onViewTrip(trip.id)}
              >
                {/* Trip Image/Icon */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0">
                  {trip.coverImage ? (
                    <img
                      src={trip.coverImage}
                      alt={trip.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-white" strokeWidth={1.5} />
                    </div>
                  )}
                  
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                {/* Trip Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {trip.name}
                      </h4>
                      
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" strokeWidth={1.5} />
                        <span className="truncate">{trip.destination}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" strokeWidth={1.5} />
                          <span>
                            {format(trip.startDate, 'dd MMM', { locale: es })} - {format(trip.endDate, 'dd MMM yyyy', { locale: es })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" strokeWidth={1.5} />
                          <span className={isActive ? 'text-green-600 font-medium' : ''}>
                            {isActive ? 'En curso' : daysUntil}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex-shrink-0 ml-4">
                      {isActive ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          En curso
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          Planificando
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Arrow indicator */}
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
              </div>
            );
          })}

          {/* View all trips link */}
          {upcomingTrips.length === 3 && (
            <Button
              size="sm"
              onClick={onViewAllTrips}
              className="w-full bg-black text-white hover:bg-white hover:text-black border border-black"
            >
              Ver todos los viajes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}