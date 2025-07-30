'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  MapPin,
  Edit,
  Trash2,
  Plus,
  AlertTriangle,
  DollarSign,
  Globe,
  Phone
} from 'lucide-react';

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

interface ItineraryDayProps {
  itinerary: Itinerary;
  onEdit?: (itinerary: Itinerary) => void;
  onDelete?: (itineraryId: string) => void;
  onAddActivity?: (date: string) => void;
  isLoading?: boolean;
}

const activityCategories = [
  { value: 'CULTURAL', label: 'Cultural', color: 'bg-purple-100 text-purple-700' },
  { value: 'FOOD', label: 'Comida', color: 'bg-orange-100 text-orange-700' },
  { value: 'NATURE', label: 'Naturaleza', color: 'bg-green-100 text-green-700' },
  { value: 'ADVENTURE', label: 'Aventura', color: 'bg-red-100 text-red-700' },
  { value: 'SHOPPING', label: 'Compras', color: 'bg-pink-100 text-pink-700' },
  { value: 'ENTERTAINMENT', label: 'Entretenimiento', color: 'bg-blue-100 text-blue-700' },
  { value: 'OTHER', label: 'Otros', color: 'bg-gray-100 text-gray-700' },
];

export function ItineraryDay({ 
  itinerary, 
  onEdit, 
  onDelete, 
  onAddActivity,
  isLoading = false 
}: ItineraryDayProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString;
  };

  const getCategoryData = (category: string) => {
    return activityCategories.find(cat => cat.value === category) || activityCategories[0];
  };

  const formatDuration = (hours?: number) => {
    if (!hours) return '';
    if (hours < 1) return `${Math.round(hours * 60)}min`;
    if (hours === Math.floor(hours)) return `${hours}h`;
    return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}min`;
  };

  const getTotalEstimatedCost = () => {
    return itinerary.activities.reduce((total, activity) => {
      return total + (activity.activity.price || 0);
    }, 0);
  };

  const getTotalEstimatedDuration = () => {
    return itinerary.activities.reduce((total, activity) => {
      return total + (activity.activity.durationHours || 0);
    }, 0);
  };

  const getTimeConflicts = () => {
    const conflicts: number[] = [];
    const sortedActivities = [...itinerary.activities]
      .filter(a => a.startTime && a.endTime)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

    for (let i = 0; i < sortedActivities.length - 1; i++) {
      const current = sortedActivities[i];
      const next = sortedActivities[i + 1];
      
      if (current.endTime && next.startTime && current.endTime > next.startTime) {
        conflicts.push(current.order, next.order);
      }
    }
    
    return conflicts;
  };

  const timeConflicts = getTimeConflicts();
  const totalCost = getTotalEstimatedCost();
  const totalDuration = getTotalEstimatedDuration();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900 capitalize">
                {formatDate(itinerary.date)}
              </h3>
            </div>
            
            {itinerary.notes && (
              <p className="text-gray-600 mt-2">{itinerary.notes}</p>
            )}

            {/* Day summary */}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
              <span>{itinerary.activities.length} actividades</span>
              {totalDuration > 0 && (
                <span>{formatDuration(totalDuration)} estimado</span>
              )}
              {totalCost > 0 && (
                <span>
                  {totalCost} {itinerary.activities[0]?.activity.currency || 'PEN'} estimado
                </span>
              )}
            </div>

            {/* Time conflicts warning */}
            {timeConflicts.length > 0 && (
              <div className="flex items-center gap-2 mt-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Conflictos de horario detectados</span>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(itinerary)}
                disabled={isLoading}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(itinerary.id)}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Activities */}
        {itinerary.activities.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">No hay actividades programadas</p>
            {onAddActivity && (
              <Button
                size="sm"
                onClick={() => onAddActivity(itinerary.date)}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar actividad
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {itinerary.activities
              .sort((a, b) => a.order - b.order)
              .map((activity, index) => {
                const categoryData = getCategoryData(activity.activity.category);
                const hasTimeConflict = timeConflicts.includes(activity.order);
                
                return (
                  <div
                    key={activity.id}
                    className={`border rounded-lg p-4 ${
                      hasTimeConflict 
                        ? 'border-orange-200 bg-orange-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Order and time */}
                      <div className="flex flex-col items-center min-w-16">
                        <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        {activity.startTime && (
                          <div className="text-xs text-gray-600 mt-2 text-center">
                            <div>{formatTime(activity.startTime)}</div>
                            {activity.endTime && (
                              <div>{formatTime(activity.endTime)}</div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Activity details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {activity.activity.name}
                              </h4>
                              <Badge className={categoryData.color}>
                                {categoryData.label}
                              </Badge>
                              {hasTimeConflict && (
                                <Badge variant="destructive" className="text-xs">
                                  Conflicto de horario
                                </Badge>
                              )}
                            </div>

                            {/* Activity info */}
                            <div className="space-y-1 text-sm text-gray-600">
                              {activity.activity.address && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3" />
                                  <span>{activity.activity.address}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-4">
                                {activity.activity.durationHours && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatDuration(activity.activity.durationHours)}</span>
                                  </div>
                                )}
                                
                                {activity.activity.price && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    <span>
                                      {activity.activity.price} {activity.activity.currency || 'PEN'}
                                    </span>
                                  </div>
                                )}

                                {activity.activity.rating && (
                                  <div className="flex items-center gap-1">
                                    <span>⭐ {activity.activity.rating}/5</span>
                                  </div>
                                )}
                              </div>

                              {activity.activity.openingHours && (
                                <div className="text-xs">
                                  Horario: {activity.activity.openingHours}
                                </div>
                              )}

                              {/* Contact info */}
                              <div className="flex items-center gap-4">
                                {activity.activity.websiteUrl && (
                                  <a
                                    href={activity.activity.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                                  >
                                    <Globe className="h-3 w-3" />
                                    <span>Website</span>
                                  </a>
                                )}
                                
                                {activity.activity.phone && (
                                  <a
                                    href={`tel:${activity.activity.phone}`}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                                  >
                                    <Phone className="h-3 w-3" />
                                    <span>{activity.activity.phone}</span>
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Activity notes */}
                            {activity.notes && (
                              <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                                <strong>Notas:</strong> {activity.notes}
                              </div>
                            )}

                            {/* Activity general notes */}
                            {activity.activity.notes && (
                              <div className="mt-2 text-xs text-gray-500">
                                {activity.activity.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}