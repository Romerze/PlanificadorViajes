'use client';

import React from 'react';
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
import { Loader2, Plane, Bus, Train, Car, Ship } from 'lucide-react';

// Schema para validación del formulario (con strings)
const transportationFormSchema = z.object({
  type: z.enum(['FLIGHT', 'BUS', 'TRAIN', 'CAR', 'BOAT', 'OTHER']),
  company: z.string().optional(),
  departureLocation: z.string().min(1, 'La ubicación de salida es requerida'),
  arrivalLocation: z.string().min(1, 'La ubicación de llegada es requerida'),
  departureDatetime: z.string().min(1, 'La fecha y hora de salida es requerida'),
  arrivalDatetime: z.string().min(1, 'La fecha y hora de llegada es requerida'),
  confirmationCode: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.departureDatetime && data.arrivalDatetime) {
    return new Date(data.arrivalDatetime) > new Date(data.departureDatetime);
  }
  return true;
}, {
  message: 'La fecha de llegada debe ser posterior a la fecha de salida',
  path: ['arrivalDatetime'],
});

// Schema para datos de salida (con tipos correctos)
const transportationSchema = z.object({
  type: z.enum(['FLIGHT', 'BUS', 'TRAIN', 'CAR', 'BOAT', 'OTHER']),
  company: z.string().optional(),
  departureLocation: z.string().min(1, 'La ubicación de salida es requerida'),
  arrivalLocation: z.string().min(1, 'La ubicación de llegada es requerida'),
  departureDatetime: z.string().min(1, 'La fecha y hora de salida es requerida'),
  arrivalDatetime: z.string().min(1, 'La fecha y hora de llegada es requerida'),
  confirmationCode: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
});

type TransportationFormData = z.infer<typeof transportationFormSchema>;
type TransportationData = z.infer<typeof transportationSchema>;

interface Transportation {
  id: string;
  type: string;
  company?: string;
  departureLocation: string;
  arrivalLocation: string;
  departureDatetime: string;
  arrivalDatetime: string;
  confirmationCode?: string;
  price?: number;
  currency?: string;
  notes?: string;
}

interface TransportationFormProps {
  initialData?: Transportation;
  onSubmit: (data: TransportationData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

const transportationTypes = [
  { value: 'FLIGHT', label: 'Vuelo', icon: Plane },
  { value: 'BUS', label: 'Bus', icon: Bus },
  { value: 'TRAIN', label: 'Tren', icon: Train },
  { value: 'CAR', label: 'Auto', icon: Car },
  { value: 'BOAT', label: 'Barco', icon: Ship },
  { value: 'OTHER', label: 'Otro', icon: Car },
];

const currencies = [
  { value: 'PEN', label: 'PEN (Soles)' },
  { value: 'USD', label: 'USD (Dólares)' },
  { value: 'EUR', label: 'EUR (Euros)' },
];

export function TransportationForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading, 
  mode 
}: TransportationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<TransportationFormData>({
    resolver: zodResolver(transportationFormSchema),
    defaultValues: {
      type: initialData?.type as any || 'FLIGHT',
      company: initialData?.company || '',
      departureLocation: initialData?.departureLocation || '',
      arrivalLocation: initialData?.arrivalLocation || '',
      departureDatetime: initialData?.departureDatetime ? 
        new Date(initialData.departureDatetime).toISOString().slice(0, 16) : '',
      arrivalDatetime: initialData?.arrivalDatetime ? 
        new Date(initialData.arrivalDatetime).toISOString().slice(0, 16) : '',
      confirmationCode: initialData?.confirmationCode || '',
      price: initialData?.price?.toString() || '',
      currency: initialData?.currency || 'PEN',
      notes: initialData?.notes || '',
    },
  });

  const type = watch('type');

  const handleFormSubmit = async (data: TransportationFormData) => {
    try {
      // Transform data for API
      const submitData: TransportationData = {
        ...data,
        departureDatetime: new Date(data.departureDatetime).toISOString(),
        arrivalDatetime: new Date(data.arrivalDatetime).toISOString(),
        price: data.price && data.price !== '' ? parseFloat(data.price) : undefined,
      };

      await onSubmit(submitData);
      reset();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const getTypeIcon = (transportType: string) => {
    const typeData = transportationTypes.find(t => t.value === transportType);
    return typeData?.icon || Car;
  };

  const TypeIcon = getTypeIcon(type);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Transport Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Tipo de transporte *</Label>
        <Select
          value={type}
          onValueChange={(value) => setValue('type', value as any)}
        >
          <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
            <SelectValue placeholder="Selecciona el tipo de transporte" />
          </SelectTrigger>
          <SelectContent>
            {transportationTypes.map((transportType) => {
              const Icon = transportType.icon;
              return (
                <SelectItem key={transportType.value} value={transportType.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {transportType.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      {/* Company */}
      <div className="space-y-2">
        <Label htmlFor="company">Compañía</Label>
        <div className="flex items-center gap-2">
          <TypeIcon className="h-5 w-5 text-gray-400" />
          <Input
            id="company"
            {...register('company')}
            placeholder="Ej: LATAM Airlines, Cruz del Sur, etc."
            className="flex-1"
          />
        </div>
      </div>

      {/* Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="departureLocation">Lugar de salida *</Label>
          <Input
            id="departureLocation"
            {...register('departureLocation')}
            placeholder="Ej: Aeropuerto Jorge Chávez"
            className={errors.departureLocation ? 'border-red-500' : ''}
          />
          {errors.departureLocation && (
            <p className="text-sm text-red-500">{errors.departureLocation.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="arrivalLocation">Lugar de llegada *</Label>
          <Input
            id="arrivalLocation"
            {...register('arrivalLocation')}
            placeholder="Ej: Aeropuerto de Cusco"
            className={errors.arrivalLocation ? 'border-red-500' : ''}
          />
          {errors.arrivalLocation && (
            <p className="text-sm text-red-500">{errors.arrivalLocation.message}</p>
          )}
        </div>
      </div>

      {/* Dates and Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="departureDatetime">Fecha y hora de salida *</Label>
          <Input
            id="departureDatetime"
            {...register('departureDatetime')}
            type="datetime-local"
            className={errors.departureDatetime ? 'border-red-500' : ''}
          />
          {errors.departureDatetime && (
            <p className="text-sm text-red-500">{errors.departureDatetime.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="arrivalDatetime">Fecha y hora de llegada *</Label>
          <Input
            id="arrivalDatetime"
            {...register('arrivalDatetime')}
            type="datetime-local"
            className={errors.arrivalDatetime ? 'border-red-500' : ''}
          />
          {errors.arrivalDatetime && (
            <p className="text-sm text-red-500">{errors.arrivalDatetime.message}</p>
          )}
        </div>
      </div>

      {/* Confirmation and Price */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="confirmationCode">Código de confirmación</Label>
          <Input
            id="confirmationCode"
            {...register('confirmationCode')}
            placeholder="Ej: ABC123"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            {...register('price')}
            type="number"
            step="0.01"
            placeholder="0.00"
            className={errors.price ? 'border-red-500' : ''}
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Moneda</Label>
          <Select
            value={watch('currency')}
            onValueChange={(value) => setValue('currency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Moneda" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Información adicional sobre el transporte..."
          className="min-h-20"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {mode === 'create' ? 'Crear Transporte' : 'Actualizar Transporte'}
        </Button>
      </div>
    </form>
  );
}