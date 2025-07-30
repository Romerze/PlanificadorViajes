'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Loader2, Calendar, MapPin, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const editTripSchema = z.object({
  name: z.string().min(1, 'El nombre del viaje es requerido'),
  destination: z.string().min(1, 'El destino es requerido'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().min(1, 'La fecha de fin es requerida'),
  status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED']),
  coverImageUrl: z.string().optional(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate'],
});

type EditTripFormData = z.infer<typeof editTripSchema>;

interface Trip {
  id: string;
  name: string;
  destination: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
  coverImageUrl: string | null;
}

interface EditTripModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedTrip: Trip) => void;
}

export function EditTripModal({ trip, isOpen, onClose, onSuccess }: EditTripModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<EditTripFormData>({
    resolver: zodResolver(editTripSchema),
    defaultValues: {
      name: trip.name,
      destination: trip.destination,
      description: trip.description || '',
      startDate: trip.startDate.split('T')[0], // Convert to YYYY-MM-DD format
      endDate: trip.endDate.split('T')[0],
      status: trip.status,
      coverImageUrl: trip.coverImageUrl || '',
    },
  });

  const watchedStatus = watch('status');

  const onSubmit = async (data: EditTripFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el viaje');
      }

      const updatedTrip = await response.json();
      
      toast({
        title: 'Viaje actualizado',
        description: 'Los datos del viaje se han actualizado correctamente',
      });

      onSuccess(updatedTrip);
      onClose();
    } catch (error) {
      console.error('Error updating trip:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al actualizar el viaje',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Editar Viaje
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Row 1: Name and Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del viaje</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ej: Viaje a Europa"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Destino
              </Label>
              <Input
                id="destination"
                {...register('destination')}
                placeholder="Ej: París, Francia"
              />
              {errors.destination && (
                <p className="text-sm text-red-600">{errors.destination.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Fecha de inicio
              </Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Fecha de fin
              </Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate')}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Row 3: Status and Cover Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estado del viaje</Label>
              <Select
                value={watchedStatus}
                onValueChange={(value) => setValue('status', value as 'PLANNING' | 'ACTIVE' | 'COMPLETED')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      {getStatusLabel('PLANNING')}
                    </div>
                  </SelectItem>
                  <SelectItem value="ACTIVE">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      {getStatusLabel('ACTIVE')}
                    </div>
                  </SelectItem>
                  <SelectItem value="COMPLETED">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full" />
                      {getStatusLabel('COMPLETED')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImageUrl">URL de imagen de portada (opcional)</Label>
              <Input
                id="coverImageUrl"
                {...register('coverImageUrl')}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {errors.coverImageUrl && (
                <p className="text-sm text-red-600">{errors.coverImageUrl.message}</p>
              )}
            </div>
          </div>

          {/* Row 4: Description (full width) */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe tu viaje..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}