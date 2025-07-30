'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, FileText, Loader2, X } from 'lucide-react';

// Validation schema
const tripFormSchema = z.object({
  name: z.string().min(1, 'El nombre del viaje es requerido'),
  destination: z.string().min(1, 'El destino es requerido'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().min(1, 'La fecha de fin es requerida'),
  coverImageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) > new Date(data.startDate);
  }
  return true;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate'],
});

type TripFormData = z.infer<typeof tripFormSchema>;

interface TripFormProps {
  initialData?: Partial<TripFormData> & { id?: string };
  onSubmit: (data: TripFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export function TripForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
}: TripFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      destination: initialData?.destination || '',
      description: initialData?.description || '',
      startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
      endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
      coverImageUrl: initialData?.coverImageUrl || '',
    },
  });

  const watchStartDate = watch('startDate');
  const watchEndDate = watch('endDate');

  // Calculate trip duration
  const tripDuration = React.useMemo(() => {
    if (watchStartDate && watchEndDate) {
      const start = new Date(watchStartDate);
      const end = new Date(watchEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  }, [watchStartDate, watchEndDate]);

  const onFormSubmit = async (data: TripFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              {mode === 'create' ? 'Crear Nuevo Viaje' : 'Editar Viaje'}
            </CardTitle>
            <CardDescription>
              {mode === 'create' 
                ? 'Planifica tu próxima aventura completando los detalles del viaje'
                : 'Actualiza los detalles de tu viaje'
              }
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Trip Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Viaje *</Label>
            <Input
              id="name"
              placeholder="ej. Aventura en Barcelona"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="destination">Destino *</Label>
            <Input
              id="destination"
              placeholder="ej. Barcelona, España"
              {...register('destination')}
              className={errors.destination ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.destination && (
              <p className="text-sm text-red-500">{errors.destination.message}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de Inicio *</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
                className={errors.startDate ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de Fin *</Label>
              <Input
                id="endDate"
                type="date"
                min={watchStartDate || undefined}
                {...register('endDate')}
                className={errors.endDate ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Trip Duration Info */}
          {tripDuration > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">
                Duración: {tripDuration} {tripDuration === 1 ? 'día' : 'días'}
              </span>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe tu viaje, objetivos, planes especiales..."
              rows={4}
              {...register('description')}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Cover Image URL */}
          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">URL de Imagen de Portada</Label>
            <Input
              id="coverImageUrl"
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              {...register('coverImageUrl')}
              className={errors.coverImageUrl ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.coverImageUrl && (
              <p className="text-sm text-red-500">{errors.coverImageUrl.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Opcional: URL de una imagen que represente tu viaje
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Crear Viaje' : 'Actualizar Viaje'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}