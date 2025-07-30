'use client';

import React, { useState } from 'react';
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
  Save,
  FileText,
  AlertTriangle,
  Lightbulb,
  Bell,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const noteSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, 'El contenido de la nota es requerido'),
  type: z.enum(['GENERAL', 'IMPORTANT', 'REMINDER', 'IDEA']).default('GENERAL'),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface Note {
  id: string;
  title?: string;
  content: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface NoteFormProps {
  initialData?: Note;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

const noteTypes = [
  { 
    value: 'GENERAL', 
    label: 'General', 
    icon: FileText, 
    color: 'bg-gray-100 text-gray-700',
    description: 'Notas generales del viaje'
  },
  { 
    value: 'IMPORTANT', 
    label: 'Importante', 
    icon: AlertTriangle, 
    color: 'bg-red-100 text-red-700',
    description: 'Información importante que no debes olvidar'
  },
  { 
    value: 'REMINDER', 
    label: 'Recordatorio', 
    icon: Bell, 
    color: 'bg-orange-100 text-orange-700',
    description: 'Recordatorios y tareas pendientes'
  },
  { 
    value: 'IDEA', 
    label: 'Idea', 
    icon: Lightbulb, 
    color: 'bg-yellow-100 text-yellow-700',
    description: 'Ideas y planes para el viaje'
  },
];

export function NoteForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading, 
  mode 
}: NoteFormProps) {
  const { toast } = useToast();
  const [preview, setPreview] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      type: (initialData?.type as any) || 'GENERAL',
    },
  });

  const selectedType = watch('type');
  const content = watch('content');
  const title = watch('title');

  const handleFormSubmit = async (data: NoteFormData) => {
    try {
      await onSubmit(data);
      if (mode === 'create') {
        reset();
      }
      
      toast({
        title: 'Éxito',
        description: mode === 'create' ? 'Nota creada exitosamente' : 'Nota actualizada exitosamente',
      });
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const getTypeData = (type: string) => {
    return noteTypes.find(t => t.value === type) || noteTypes[0];
  };

  const typeData = getTypeData(selectedType);
  const TypeIcon = typeData.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPreview = () => {
    if (!content && !title) {
      return (
        <div className="text-center py-8">
          <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Escribe algo para ver la vista previa</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {title && (
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
        )}
        
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-2 rounded-lg ${typeData.color}`}>
            <TypeIcon className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-gray-900">{typeData.label}</span>
        </div>

        <div className="prose prose-sm max-w-none">
          {content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-2 text-gray-900">
              {paragraph || '\u00A0'}
            </p>
          ))}
        </div>

        {initialData && (
          <div className="text-xs text-gray-500 mt-4 pt-4 border-t">
            <p>Creada: {formatDate(initialData.createdAt)}</p>
            <p>Actualizada: {formatDate(initialData.updatedAt)}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={!preview ? "default" : "outline"}
          size="sm"
          onClick={() => setPreview(false)}
        >
          Editar
        </Button>
        <Button
          type="button"
          variant={preview ? "default" : "outline"}
          size="sm"
          onClick={() => setPreview(true)}
        >
          Vista previa
        </Button>
      </div>

      {preview ? (
        <div className="border rounded-lg p-6 bg-white min-h-96">
          {renderPreview()}
        </div>
      ) : (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Note Type */}
          <div className="space-y-2">
            <Label>Tipo de nota *</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue('type', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de nota" />
              </SelectTrigger>
              <SelectContent>
                {noteTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded ${type.color}`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
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

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título (opcional)</Label>
            <div className="flex items-center gap-2">
              <TypeIcon className="h-5 w-5 text-gray-400" />
              <Input
                id="title"
                {...register('title')}
                placeholder="Ej: Cosas que no debo olvidar en Tokyo"
                className="flex-1"
              />
            </div>
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenido *</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="Escribe tu nota aquí..."
              className="min-h-64 resize-y"
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Puedes usar saltos de línea para organizar tu texto. 
              {content && ` ${content.length} caracteres`}
            </p>
          </div>

          {/* Type Info */}
          <div className={`p-4 rounded-lg ${typeData.color} bg-opacity-50`}>
            <div className="flex items-center gap-2 mb-2">
              <TypeIcon className="h-4 w-4" />
              <span className="font-medium">{typeData.label}</span>
            </div>
            <p className="text-sm">{typeData.description}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Crear nota' : 'Actualizar nota'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}