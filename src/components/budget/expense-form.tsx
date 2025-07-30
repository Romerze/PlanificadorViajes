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
  Receipt, 
  MapPin, 
  Calendar,
  DollarSign
} from 'lucide-react';

const expenseSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida'),
  amount: z.string().min(1, 'El monto es requerido').transform((val) => parseFloat(val)),
  currency: z.string().min(1, 'La moneda es requerida'),
  date: z.string().min(1, 'La fecha es requerida'),
  category: z.string().min(1, 'La categoría es requerida'),
  location: z.string().optional(),
  receiptUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  notes: z.string().optional(),
  budgetId: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  category: string;
  location?: string;
  receiptUrl?: string;
  notes?: string;
  budgetId?: string;
}

interface Budget {
  id: string;
  category: string;
}

interface ExpenseFormProps {
  initialData?: Expense;
  budgets: Budget[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

const expenseCategories = [
  'Transporte',
  'Hospedaje', 
  'Comida',
  'Actividades',
  'Compras',
  'Emergencia',
  'Otros'
];

const currencies = [
  { value: 'PEN', label: 'PEN (Soles)' },
  { value: 'USD', label: 'USD (Dólares)' },
  { value: 'EUR', label: 'EUR (Euros)' },
];

export function ExpenseForm({ 
  initialData, 
  budgets,
  onSubmit, 
  onCancel, 
  isLoading, 
  mode 
}: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: initialData?.description || '',
      amount: initialData?.amount?.toString() || '',
      currency: initialData?.currency || 'PEN',
      date: initialData?.date ? 
        new Date(initialData.date).toISOString().slice(0, 10) : '',
      category: initialData?.category || '',
      location: initialData?.location || '',
      receiptUrl: initialData?.receiptUrl || '',
      notes: initialData?.notes || '',
      budgetId: initialData?.budgetId || 'none',
    },
  });

  const category = watch('category');
  const budgetId = watch('budgetId');

  const handleFormSubmit = async (data: ExpenseFormData) => {
    try {
      // Transform data for API
      const submitData = {
        ...data,
        date: new Date(data.date).toISOString(),
        receiptUrl: data.receiptUrl || undefined,
        budgetId: data.budgetId && data.budgetId !== 'none' ? data.budgetId : undefined,
      };

      await onSubmit(submitData);
      reset();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción *</Label>
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-gray-400" />
          <Input
            id="description"
            {...register('description')}
            placeholder="Ej: Almuerzo en restaurante local"
            className={`flex-1 ${errors.description ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Amount, Currency and Date */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="amount">Monto *</Label>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-400" />
            <Input
              id="amount"
              {...register('amount')}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={`flex-1 ${errors.amount ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
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
      </div>

      {/* Category and Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category">Categoría *</Label>
          <Select
            value={category}
            onValueChange={(value) => setValue('category', value)}
          >
            <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="budgetId">Presupuesto (opcional)</Label>
          <Select
            value={budgetId}
            onValueChange={(value) => setValue('budgetId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un presupuesto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin asignar</SelectItem>
              {budgets.map((budget) => (
                <SelectItem key={budget.id} value={budget.id}>
                  {budget.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Location and Receipt URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="location">Ubicación</Label>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-400" />
            <Input
              id="location"
              {...register('location')}
              placeholder="Ej: Centro de Lima"
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="receiptUrl">URL del recibo</Label>
          <Input
            id="receiptUrl"
            {...register('receiptUrl')}
            type="url"
            placeholder="https://..."
            className={errors.receiptUrl ? 'border-red-500' : ''}
          />
          {errors.receiptUrl && (
            <p className="text-sm text-red-500">{errors.receiptUrl.message}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Información adicional sobre este gasto..."
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
          {mode === 'create' ? 'Agregar Gasto' : 'Actualizar Gasto'}
        </Button>
      </div>
    </form>
  );
}