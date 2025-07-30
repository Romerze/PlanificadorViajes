'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Loader2, 
  Calendar,
  Plus,
  Trash2,
  Clock,
  MapPin,
  DragHandleDots2Icon as GripVertical
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const itinerarySchema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
  notes: z.string().optional(),
  activities: z.array(z.object({
    activityId: z.string().min(1, 'Selecciona una actividad'),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    order: z.number(),
    notes: z.string().optional(),
  })).optional(),
});

type ItineraryFormData = z.infer<typeof itinerarySchema>;

interface Activity {
  id: string;
  name: string;
  category: string;
  address?: string;
  price?: number;
  currency?: string;
  durationHours?: number;
}

interface ItineraryActivity {
  id?: string;
  activityId: string;
  startTime?: string;
  endTime?: string;
  order: number;
  notes?: string;
  activity?: Activity;
}

interface Itinerary {
  id: string;
  date: string;
  notes?: string;
  activities: ItineraryActivity[];
}

interface ItineraryFormProps {
  tripId: string;
  initialData?: Itinerary;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
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

export function ItineraryForm({ 
  tripId,
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading, 
  mode 
}: ItineraryFormProps) {
  const { toast } = useToast();
  const [availableActivities, setAvailableActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [selectedActivities, setSelectedActivities] = useState<ItineraryActivity[]>(
    initialData?.activities || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ItineraryFormData>({
    resolver: zodResolver(itinerarySchema),
    defaultValues: {
      date: initialData?.date ? 
        new Date(initialData.date).toISOString().slice(0, 10) : '',
      notes: initialData?.notes || '',
      activities: initialData?.activities || [],
    },
  });

  // Load available activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/trips/${tripId}/activities`);
        if (response.ok) {
          const data = await response.json();
          setAvailableActivities(data.activities || []);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las actividades',
          variant: 'destructive',
        });
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [tripId, toast]);

  const handleFormSubmit = async (data: ItineraryFormData) => {
    try {
      const submitData = {
        ...data,
        activities: selectedActivities,
      };

      await onSubmit(submitData);
      reset();
      setSelectedActivities([]);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const addActivity = () => {
    const newActivity: ItineraryActivity = {
      activityId: '',
      startTime: '',
      endTime: '',
      order: selectedActivities.length,
      notes: '',
    };
    setSelectedActivities([...selectedActivities, newActivity]);
  };

  const removeActivity = (index: number) => {
    const updated = selectedActivities.filter((_, i) => i !== index);
    // Reorder remaining activities
    const reordered = updated.map((activity, i) => ({
      ...activity,
      order: i,
    }));
    setSelectedActivities(reordered);
  };

  const updateActivity = (index: number, field: keyof ItineraryActivity, value: any) => {
    const updated = [...selectedActivities];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedActivities(updated);
  };

  const moveActivity = (fromIndex: number, toIndex: number) => {
    const updated = [...selectedActivities];
    const [movedActivity] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedActivity);
    
    // Reorder
    const reordered = updated.map((activity, i) => ({
      ...activity,
      order: i,
    }));
    setSelectedActivities(reordered);
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

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Date and Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="date">Fecha *</Label>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <Input
              id="date"
              {...register('date')}
              type="date"
              className={`flex-1 ${errors.date ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas del día</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Notas generales para este día..."
            className="min-h-12"
          />
        </div>
      </div>

      {/* Activities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Actividades del día</h3>
          <Button
            type="button"
            onClick={addActivity}
            variant="outline"
            size="sm"
            disabled={loadingActivities || availableActivities.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar actividad
          </Button>
        </div>

        {loadingActivities ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-600 mt-2">Cargando actividades...</p>
          </div>
        ) : availableActivities.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              No hay actividades disponibles. 
              <br />
              Primero crea algunas actividades para poder agregarlas al itinerario.
            </p>
          </div>
        ) : selectedActivities.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No hay actividades programadas para este día</p>
            <Button
              type="button"
              onClick={addActivity}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar primera actividad
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedActivities.map((activity, index) => {
              const selectedActivity = availableActivities.find(a => a.id === activity.activityId);
              const categoryData = selectedActivity ? getCategoryData(selectedActivity.category) : null;
              
              return (
                <div key={index} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start gap-4">
                    {/* Drag handle */}
                    <div className="mt-2">
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                    </div>

                    {/* Activity selection and details */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Activity selection */}
                      <div className="space-y-2">
                        <Label>Actividad *</Label>
                        <Select
                          value={activity.activityId}
                          onValueChange={(value) => updateActivity(index, 'activityId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una actividad" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableActivities.map((act) => {
                              const catData = getCategoryData(act.category);
                              return (
                                <SelectItem key={act.id} value={act.id}>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs ${catData.color}`}>
                                      {catData.label}
                                    </span>
                                    <span>{act.name}</span>
                                    {act.address && (
                                      <span className="text-gray-500 text-sm">• {act.address}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        
                        {/* Activity details */}
                        {selectedActivity && (
                          <div className="text-sm text-gray-600 space-y-1">
                            {selectedActivity.address && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{selectedActivity.address}</span>
                              </div>
                            )}
                            {selectedActivity.durationHours && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Duración: {formatDuration(selectedActivity.durationHours)}</span>
                              </div>
                            )}
                            {selectedActivity.price && (
                              <div>
                                Precio: {selectedActivity.price} {selectedActivity.currency || 'PEN'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Time and notes */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-sm">Hora inicio</Label>
                            <Input
                              type="time"
                              value={activity.startTime || ''}
                              onChange={(e) => updateActivity(index, 'startTime', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm">Hora fin</Label>
                            <Input
                              type="time"
                              value={activity.endTime || ''}
                              onChange={(e) => updateActivity(index, 'endTime', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-sm">Notas</Label>
                          <Textarea
                            value={activity.notes || ''}
                            onChange={(e) => updateActivity(index, 'notes', e.target.value)}
                            placeholder="Notas para esta actividad..."
                            className="min-h-16 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Remove button */}
                    <Button
                      type="button"
                      onClick={() => removeActivity(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 mt-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {mode === 'create' ? 'Crear Itinerario' : 'Actualizar Itinerario'}
        </Button>
      </div>
    </form>
  );
}