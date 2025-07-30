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
  Upload,
  Calendar,
  MapPin,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const photoUploadSchema = z.object({
  caption: z.string().optional(),
  takenAt: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  itineraryId: z.string().optional(),
  activityId: z.string().optional(),
});

type PhotoUploadFormData = z.infer<typeof photoUploadSchema>;

interface Itinerary {
  id: string;
  date: string;
}

interface Activity {
  id: string;
  name: string;
  category: string;
}

interface PhotoUploadProps {
  tripId: string;
  itineraries?: Itinerary[];
  activities?: Activity[];
  onUploadComplete: (photos: any[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PhotoUpload({ 
  tripId,
  itineraries = [],
  activities = [],
  onUploadComplete, 
  onCancel,
  isLoading = false
}: PhotoUploadProps) {
  const { toast } = useToast();
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<PhotoUploadFormData>({
    resolver: zodResolver(photoUploadSchema),
  });

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validFiles = files.filter(file => {
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Archivo no válido',
          description: `${file.name} no es un formato de imagen válido`,
          variant: 'destructive',
        });
        return false;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'Archivo muy grande',
          description: `${file.name} es demasiado grande. Máximo 10MB`,
          variant: 'destructive',
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    setSelectedFiles(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude);
          setValue('longitude', position.coords.longitude);
          toast({
            title: 'Ubicación obtenida',
            description: 'Se ha agregado la ubicación actual a las fotos',
          });
        },
        (error) => {
          toast({
            title: 'Error de ubicación',
            description: 'No se pudo obtener la ubicación actual',
            variant: 'destructive',
          });
        }
      );
    } else {
      toast({
        title: 'Geolocalización no disponible',
        description: 'Tu navegador no soporta geolocalización',
        variant: 'destructive',
      });
    }
  };

  const uploadFiles = async (metadata: PhotoUploadFormData) => {
    setUploadingFiles(true);
    const uploadedPhotos = [];

    try {
      for (const file of selectedFiles) {
        // Upload file first
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.message || 'Error al subir archivo');
        }

        const uploadResult = await uploadResponse.json();
        
        // Create photo record
        const photoData = {
          fileUrl: uploadResult.fileUrl,
          thumbnailUrl: uploadResult.fileUrl, // For now, use same URL
          caption: metadata.caption,
          takenAt: metadata.takenAt ? new Date(metadata.takenAt).toISOString() : undefined,
          latitude: metadata.latitude,
          longitude: metadata.longitude,
          itineraryId: metadata.itineraryId || undefined,
          activityId: metadata.activityId || undefined,
        };

        const photoResponse = await fetch(`/api/trips/${tripId}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(photoData),
        });

        if (!photoResponse.ok) {
          const error = await photoResponse.json();
          throw new Error(error.message || 'Error al crear registro de foto');
        }

        const photo = await photoResponse.json();
        uploadedPhotos.push(photo);
      }

      onUploadComplete(uploadedPhotos);
      reset();
      setSelectedFiles([]);
      setPreviews([]);
      
      toast({
        title: 'Éxito',
        description: `${uploadedPhotos.length} foto(s) subida(s) exitosamente`,
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al subir fotos',
        variant: 'destructive',
      });
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleFormSubmit = async (data: PhotoUploadFormData) => {
    if (selectedFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'Selecciona al menos una foto para subir',
        variant: 'destructive',
      });
      return;
    }

    await uploadFiles(data);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* File Upload Area */}
      <div className="space-y-4">
        <Label>Seleccionar fotos *</Label>
        
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <div>
            <p className="text-gray-600 mb-2">Arrastra fotos aquí o</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('photo-upload')?.click()}
              disabled={uploadingFiles}
            >
              <Upload className="h-4 w-4 mr-2" />
              Seleccionar fotos
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG, GIF o WebP hasta 10MB cada una
          </p>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelection}
            className="hidden"
          />
        </div>

        {/* File Previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {selectedFiles[index]?.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="caption">Descripción</Label>
          <Textarea
            id="caption"
            {...register('caption')}
            placeholder="Describe estas fotos..."
            className="min-h-20"
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="takenAt">Fecha tomada</Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <Input
                id="takenAt"
                {...register('takenAt')}
                type="datetime-local"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ubicación</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                className="flex-shrink-0"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Ubicación actual
              </Button>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  {...register('latitude', { valueAsNumber: true })}
                  placeholder="Latitud"
                  type="number"
                  step="any"
                  className="text-sm"
                />
                <Input
                  {...register('longitude', { valueAsNumber: true })}
                  placeholder="Longitud"
                  type="number"
                  step="any"
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Associations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Día del viaje</Label>
          <Select onValueChange={(value) => setValue('itineraryId', value === 'none' ? undefined : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar día (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ninguno</SelectItem>
              {itineraries.map((itinerary) => (
                <SelectItem key={itinerary.id} value={itinerary.id}>
                  {formatDate(itinerary.date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Actividad</Label>
          <Select onValueChange={(value) => setValue('activityId', value === 'none' ? undefined : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar actividad (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ninguna</SelectItem>
              {activities.map((activity) => (
                <SelectItem key={activity.id} value={activity.id}>
                  {activity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || uploadingFiles}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || uploadingFiles || selectedFiles.length === 0}
        >
          {(isLoading || uploadingFiles) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Subir {selectedFiles.length > 0 && `${selectedFiles.length} foto${selectedFiles.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </form>
  );
}