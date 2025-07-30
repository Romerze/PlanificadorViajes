'use client';

import React, { useEffect } from 'react';
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
import { Loader2, Building2, Home, MapPin, Star } from 'lucide-react';

const accommodationSchema = z.object({
  name: z.string().min(1, 'El nombre del hospedaje es requerido'),
  type: z.enum(['HOTEL', 'HOSTEL', 'AIRBNB', 'APARTMENT', 'HOUSE', 'OTHER']),
  address: z.string().min(1, 'La dirección es requerida'),
  checkInDate: z.string().min(1, 'La fecha de check-in es requerida'),
  checkOutDate: z.string().min(1, 'La fecha de check-out es requerida'),
  pricePerNight: z.string().optional().transform((val) => val && val !== '' ? parseFloat(val) : undefined),
  totalPrice: z.string().optional().transform((val) => val && val !== '' ? parseFloat(val) : undefined),
  currency: z.string().optional(),
  bookingUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  confirmationCode: z.string().optional(),
  rating: z.string().optional().transform((val) => val && val !== '' && val !== '0' ? parseInt(val) : undefined),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.checkInDate && data.checkOutDate) {
    return new Date(data.checkOutDate) > new Date(data.checkInDate);
  }
  return true;
}, {
  message: 'La fecha de check-out debe ser posterior a la fecha de check-in',
  path: ['checkOutDate'],
});

type AccommodationFormData = z.infer<typeof accommodationSchema>;

interface Accommodation {
  id: string;
  name: string;
  type: string;
  address: string;
  checkInDate: string;
  checkOutDate: string;
  pricePerNight?: number;
  totalPrice?: number;
  currency?: string;
  bookingUrl?: string;
  confirmationCode?: string;
  rating?: number;
  notes?: string;
}

interface AccommodationFormProps {
  initialData?: Accommodation;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

const accommodationTypes = [
  { value: 'HOTEL', label: 'Hotel', icon: Building2 },
  { value: 'HOSTEL', label: 'Hostal', icon: Building2 },
  { value: 'AIRBNB', label: 'Airbnb', icon: Home },
  { value: 'APARTMENT', label: 'Apartamento', icon: Home },
  { value: 'HOUSE', label: 'Casa', icon: Home },
  { value: 'OTHER', label: 'Otro', icon: Building2 },
];

const currencies = [
  { value: 'PEN', label: 'PEN (Soles)' },
  { value: 'USD', label: 'USD (Dólares)' },
  { value: 'EUR', label: 'EUR (Euros)' },
];

export function AccommodationForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading, 
  mode 
}: AccommodationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(accommodationSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type as any || 'HOTEL',
      address: initialData?.address || '',
      checkInDate: initialData?.checkInDate ? 
        new Date(initialData.checkInDate).toISOString().slice(0, 10) : '',
      checkOutDate: initialData?.checkOutDate ? 
        new Date(initialData.checkOutDate).toISOString().slice(0, 10) : '',
      pricePerNight: (initialData?.pricePerNight ? String(initialData.pricePerNight) : '') as string,
      totalPrice: (initialData?.totalPrice ? String(initialData.totalPrice) : '') as string,
      currency: initialData?.currency || 'PEN',
      bookingUrl: initialData?.bookingUrl || '',
      confirmationCode: initialData?.confirmationCode || '',
      rating: initialData?.rating ? String(initialData.rating) : '0',
      notes: initialData?.notes || '',
    },
  });

  const type = watch('type');
  const rating = watch('rating');
  const checkInDate = watch('checkInDate');
  const checkOutDate = watch('checkOutDate');
  const pricePerNight = watch('pricePerNight');

  // Calculate total price automatically
  useEffect(() => {
    if (checkInDate && checkOutDate && pricePerNight) {
      const startDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);
      
      if (endDate > startDate) {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const totalPrice = nights * parseFloat(pricePerNight);
        
        if (!isNaN(totalPrice) && totalPrice > 0) {
          setValue('totalPrice', totalPrice.toFixed(2));
        }
      }
    }
  }, [checkInDate, checkOutDate, pricePerNight, setValue]);

  const handleFormSubmit = async (data: AccommodationFormData) => {
    try {
      // Transform data for API
      const submitData = {
        ...data,
        checkInDate: new Date(data.checkInDate).toISOString(),
        checkOutDate: new Date(data.checkOutDate).toISOString(),
        pricePerNight: data.pricePerNight || undefined,
        totalPrice: data.totalPrice || undefined,
        rating: data.rating || undefined,
        bookingUrl: data.bookingUrl || undefined,
      };

      await onSubmit(submitData);
      reset();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const getTypeIcon = (accommodationType: string) => {
    const typeData = accommodationTypes.find(t => t.value === accommodationType);
    return typeData?.icon || Building2;
  };

  const TypeIcon = getTypeIcon(type);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del hospedaje *</Label>
          <div className="flex items-center gap-2">
            <TypeIcon className="h-5 w-5 text-gray-400" />
            <Input
              id="name"
              {...register('name')}
              placeholder="Ej: Hotel Machu Picchu"
              className={`flex-1 ${errors.name ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo de hospedaje *</Label>
          <Select
            value={type}
            onValueChange={(value) => setValue('type', value as any)}
          >
            <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              {accommodationTypes.map((accommodationType) => {
                const Icon = accommodationType.icon;
                return (
                  <SelectItem key={accommodationType.value} value={accommodationType.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {accommodationType.label}
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
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Dirección *</Label>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gray-400" />
          <Input
            id="address"
            {...register('address')}
            placeholder="Ej: Av. Pachacutec 123, Aguas Calientes, Cusco"
            className={`flex-1 ${errors.address ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.address && (
          <p className="text-sm text-red-500">{errors.address.message}</p>
        )}
      </div>

      {/* Check-in and Check-out dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="checkInDate">Fecha de check-in *</Label>
          <Input
            id="checkInDate"
            {...register('checkInDate')}
            type="date"
            className={errors.checkInDate ? 'border-red-500' : ''}
          />
          {errors.checkInDate && (
            <p className="text-sm text-red-500">{errors.checkInDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkOutDate">Fecha de check-out *</Label>
          <Input
            id="checkOutDate"
            {...register('checkOutDate')}
            type="date"
            className={errors.checkOutDate ? 'border-red-500' : ''}
          />
          {errors.checkOutDate && (
            <p className="text-sm text-red-500">{errors.checkOutDate.message}</p>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="pricePerNight">Precio por noche</Label>
          <Input
            id="pricePerNight"
            {...register('pricePerNight')}
            type="number"
            step="0.01"
            placeholder="0.00"
            className={errors.pricePerNight ? 'border-red-500' : ''}
          />
          {errors.pricePerNight && (
            <p className="text-sm text-red-500">{errors.pricePerNight.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalPrice">Precio total</Label>
          <div className="relative">
            <Input
              id="totalPrice"
              {...register('totalPrice')}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={errors.totalPrice ? 'border-red-500' : ''}
            />
            {checkInDate && checkOutDate && pricePerNight && (
              <p className="text-xs text-gray-500 mt-1">
                Se calcula automáticamente: {Math.ceil(Math.abs(new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))} noches × {pricePerNight}
              </p>
            )}
          </div>
          {errors.totalPrice && (
            <p className="text-sm text-red-500">{errors.totalPrice.message}</p>
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

      {/* Booking details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="bookingUrl">URL de reserva</Label>
          <Input
            id="bookingUrl"
            {...register('bookingUrl')}
            type="url"
            placeholder="https://..."
            className={errors.bookingUrl ? 'border-red-500' : ''}
          />
          {errors.bookingUrl && (
            <p className="text-sm text-red-500">{errors.bookingUrl.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmationCode">Código de confirmación</Label>
          <Input
            id="confirmationCode"
            {...register('confirmationCode')}
            placeholder="Ej: ABC123456"
          />
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <Label htmlFor="rating">Calificación</Label>
        <div className="flex items-center gap-2">
          <Select
            value={rating}
            onValueChange={(value) => setValue('rating', value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="0" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Sin calificar</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
            </SelectContent>
          </Select>
          {rating && rating !== "0" && (
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < parseInt(rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Información adicional sobre el hospedaje..."
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
          {mode === 'create' ? 'Crear Hospedaje' : 'Actualizar Hospedaje'}
        </Button>
      </div>
    </form>
  );
}