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
import { 
  Loader2, 
  Plane, 
  Building, 
  Utensils, 
  MapPin, 
  ShoppingBag, 
  Shield, 
  MoreHorizontal 
} from 'lucide-react';

const budgetSchema = z.object({
  category: z.enum(['TRANSPORT', 'ACCOMMODATION', 'FOOD', 'ACTIVITIES', 'SHOPPING', 'EMERGENCY', 'OTHER']),
  plannedAmount: z.string().min(1, 'El monto planificado es requerido').transform((val) => parseFloat(val)),
  currency: z.string().min(1, 'La moneda es requerida'),
  notes: z.string().optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface Budget {
  id: string;
  category: string;
  plannedAmount: number;
  actualAmount: number;
  currency: string;
  notes?: string;
}

interface BudgetFormProps {
  initialData?: Budget;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

const budgetCategories = [
  { value: 'TRANSPORT', label: 'Transporte', icon: Plane, color: 'bg-blue-100 text-blue-700' },
  { value: 'ACCOMMODATION', label: 'Hospedaje', icon: Building, color: 'bg-green-100 text-green-700' },
  { value: 'FOOD', label: 'Comida', icon: Utensils, color: 'bg-orange-100 text-orange-700' },
  { value: 'ACTIVITIES', label: 'Actividades', icon: MapPin, color: 'bg-purple-100 text-purple-700' },
  { value: 'SHOPPING', label: 'Compras', icon: ShoppingBag, color: 'bg-pink-100 text-pink-700' },
  { value: 'EMERGENCY', label: 'Emergencia', icon: Shield, color: 'bg-red-100 text-red-700' },
  { value: 'OTHER', label: 'Otros', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700' },
];

const currencies = [
  { value: 'PEN', label: 'PEN (Soles)' },
  { value: 'USD', label: 'USD (Dólares)' },
  { value: 'EUR', label: 'EUR (Euros)' },
];

export function BudgetForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading, 
  mode 
}: BudgetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: initialData?.category as any || 'TRANSPORT',
      plannedAmount: initialData?.plannedAmount?.toString() || '',
      currency: initialData?.currency || 'PEN',
      notes: initialData?.notes || '',
    },
  });

  const category = watch('category');

  const handleFormSubmit = async (data: BudgetFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const getCategoryData = (categoryValue: string) => {
    return budgetCategories.find(cat => cat.value === categoryValue) || budgetCategories[0];
  };

  const categoryData = getCategoryData(category);
  const CategoryIcon = categoryData.icon;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Category */}
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
            {budgetCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <SelectItem key={cat.value} value={cat.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {cat.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      {/* Amount and Currency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="plannedAmount">Monto planificado *</Label>
          <div className="flex items-center gap-2">
            <CategoryIcon className="h-5 w-5 text-gray-400" />
            <Input
              id="plannedAmount"
              {...register('plannedAmount')}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={`flex-1 ${errors.plannedAmount ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.plannedAmount && (
            <p className="text-sm text-red-500">{errors.plannedAmount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Moneda *</Label>
          <Select
            value={watch('currency')}
            onValueChange={(value) => setValue('currency', value)}
          >
            <SelectTrigger className={errors.currency ? 'border-red-500' : ''}>
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
          {errors.currency && (
            <p className="text-sm text-red-500">{errors.currency.message}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Información adicional sobre este presupuesto..."
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
          {mode === 'create' ? 'Crear Presupuesto' : 'Actualizar Presupuesto'}
        </Button>
      </div>
    </form>
  );
}