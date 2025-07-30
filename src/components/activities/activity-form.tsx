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
import { Loader2, Star } from 'lucide-react';

const activitySchema = z.object({
  name: z.string().min(1, 'El nombre de la actividad es requerido'),
  category: z.enum(['CULTURAL', 'FOOD', 'NATURE', 'ADVENTURE', 'SHOPPING', 'ENTERTAINMENT', 'OTHER']),
  address: z.string().optional(),
  price: z.string().optional().transform((val) => val && val !== '' ? parseFloat(val) : undefined),
  currency: z.string().optional(),
  durationHours: z.string().optional().transform((val) => val && val !== '' ? parseFloat(val) : undefined),
  openingHours: z.string().optional(),
  websiteUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
  rating: z.string().optional().transform((val) => val && val !== '' && val !== '0' ? parseInt(val) : undefined),
});

type ActivityFormData = z.infer<typeof activitySchema>;

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

interface ActivityFormProps {
  initialData?: Activity;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

const activityCategories = [
  { value: 'CULTURAL', label: 'Cultural' },
  { value: 'FOOD', label: 'Gastronomía' },
  { value: 'NATURE', label: 'Naturaleza' },
  { value: 'ADVENTURE', label: 'Aventura' },
  { value: 'SHOPPING', label: 'Compras' },
  { value: 'ENTERTAINMENT', label: 'Entretenimiento' },
  { value: 'OTHER', label: 'Otro' },
];

const currencies = [
  { value: 'PEN', label: 'PEN (Soles)' },
  { value: 'USD', label: 'USD (Dólares)' },
  { value: 'EUR', label: 'EUR (Euros)' },
];

export function ActivityForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading, 
  mode 
}: ActivityFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      name: initialData?.name || '',
      category: initialData?.category as any || 'CULTURAL',
      address: initialData?.address || '',
      price: initialData?.price?.toString() || '',
      currency: initialData?.currency || 'PEN',
      durationHours: initialData?.durationHours?.toString() || '',
      openingHours: initialData?.openingHours || '',
      websiteUrl: initialData?.websiteUrl || '',
      phone: initialData?.phone || '',
      notes: initialData?.notes || '',
      rating: initialData?.rating?.toString() || '',
    },
  });

  const category = watch('category');
  const rating = watch('rating');

  const handleFormSubmit = async (data: ActivityFormData) => {
    try {
      // Transform data for API
      const submitData = {
        ...data,
        price: data.price || undefined,
        durationHours: data.durationHours || undefined,
        rating: data.rating || undefined,
        websiteUrl: data.websiteUrl || undefined,
      };

      await onSubmit(submitData);
      reset();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la actividad *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Ej: Visita a Machu Picchu"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoría *</Label>
          <Select
            value={category}
            onValueChange={(value) => setValue('category', value as any)}
          >
            <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {activityCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          {...register('address')}
          placeholder="Ej: Av. Pachacutec s/n, Aguas Calientes"
        />
      </div>

      {/* Price and Duration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <div className="space-y-2">
          <Label htmlFor="durationHours">Duración (horas)</Label>
          <Input
            id="durationHours"
            {...register('durationHours')}
            type="number"
            step="0.5"
            placeholder="2.5"
            className={errors.durationHours ? 'border-red-500' : ''}
          />
          {errors.durationHours && (
            <p className="text-sm text-red-500">{errors.durationHours.message}</p>
          )}
        </div>
      </div>

      {/* Contact and Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="openingHours">Horarios de atención</Label>
          <Input
            id="openingHours"
            {...register('openingHours')}
            placeholder="Ej: 9:00 - 17:00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="Ej: +51 984 123456"
          />
        </div>
      </div>

      {/* Website and Rating */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Sitio web</Label>
          <Input
            id="websiteUrl"
            {...register('websiteUrl')}
            type="url"
            placeholder="https://..."
            className={errors.websiteUrl ? 'border-red-500' : ''}
          />
          {errors.websiteUrl && (
            <p className="text-sm text-red-500">{errors.websiteUrl.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Calificación</Label>
          <div className="flex items-center gap-2">
            <Select
              value={rating}
              onValueChange={(value) => setValue('rating', value)}
            >
              <SelectTrigger className="w-20">
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
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Información adicional sobre la actividad..."
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
          {mode === 'create' ? 'Crear Actividad' : 'Actualizar Actividad'}
        </Button>
      </div>
    </form>
  );
}