'use client';

import React from 'react';
import { Calendar, MapPin, Users, Clock, MoreHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TripCardProps {
  trip: {
    id: string;
    name: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    coverImage?: string;
    status: 'planning' | 'active' | 'completed';
    participantCount?: number;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onView?: (id: string) => void;
}

const statusConfig = {
  planning: {
    label: 'Planificando',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
  },
  active: {
    label: 'En Curso',
    className: 'bg-green-50 text-green-700 border border-green-200',
    dot: 'bg-green-500',
  },
  completed: {
    label: 'Completado',
    className: 'bg-gray-50 text-gray-700 border border-gray-200',
    dot: 'bg-gray-500',
  },
} as const;

export function TripCard({ trip, onEdit, onDelete, onDuplicate, onView }: TripCardProps) {
  const status = statusConfig[trip.status];
  const daysUntilTrip = formatDistanceToNow(trip.startDate, { 
    addSuffix: true, 
    locale: es 
  });
  const tripDuration = Math.ceil(
    (trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleCardClick = () => {
    onView?.(trip.id);
  };

  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer border border-gray-200 bg-white"
      onClick={handleCardClick}
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600">
        {trip.coverImage ? (
          <img
            src={trip.coverImage}
            alt={trip.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
            <MapPin className="h-12 w-12 text-white/80" strokeWidth={1.5} />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView?.(trip.id); }}>
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(trip.id); }}>
                Editar viaje
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate?.(trip.id); }}>
                Duplicar como plantilla
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete?.(trip.id); }}
                className="text-red-600 focus:text-red-600"
              >
                Eliminar viaje
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Trip Title */}
        <h3 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {trip.name}
        </h3>
        
        {/* Destination */}
        <div className="mb-4 flex items-center gap-2 text-gray-600">
          <MapPin className="h-4 w-4" strokeWidth={1.5} />
          <span className="text-sm font-medium">{trip.destination}</span>
        </div>

        {/* Trip Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Date Range */}
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" strokeWidth={1.5} />
            <div>
              <p className="font-medium text-gray-900">
                {trip.startDate.toLocaleDateString('es-PE', { 
                  day: 'numeric', 
                  month: 'short' 
                })}
                {' - '}
                {trip.endDate.toLocaleDateString('es-PE', { 
                  day: 'numeric', 
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
              <p className="text-xs text-gray-500">{daysUntilTrip}</p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" strokeWidth={1.5} />
            <div>
              <p className="font-medium text-gray-900">
                {tripDuration} {tripDuration === 1 ? 'día' : 'días'}
              </p>
              <p className="text-xs text-gray-500">Duración</p>
            </div>
          </div>
        </div>

        {/* Participants (if available) */}
        {trip.participantCount && (
          <div className="mt-4 flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-sm">
              {trip.participantCount} {trip.participantCount === 1 ? 'viajero' : 'viajeros'}
            </span>
          </div>
        )}

        {/* Progress Bar (for planning status) */}
        {trip.status === 'planning' && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progreso de planificación</span>
              <span>65%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-[65%] bg-blue-500 rounded-full transition-all duration-300" />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}