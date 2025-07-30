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
  FileText,
  CreditCard,
  Plane,
  Home,
  Shield,
  MoreHorizontal,
  Calendar,
  File,
  AlertTriangle
} from 'lucide-react';

const documentSchema = z.object({
  name: z.string().min(1, 'El nombre del documento es requerido'),
  type: z.enum(['PASSPORT', 'VISA', 'TICKET', 'RESERVATION', 'INSURANCE', 'OTHER']),
  fileUrl: z.string().min(1, 'URL de archivo requerida').refine(
    (url) => url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://'),
    'URL de archivo inválida'
  ),
  fileType: z.string().min(1, 'El tipo de archivo es requerido'),
  fileSize: z.number().positive('El tamaño del archivo debe ser positivo'),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface Document {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  expiryDate?: string;
  notes?: string;
}

interface DocumentFormProps {
  initialData?: Document;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

const documentTypes = [
  { value: 'PASSPORT', label: 'Pasaporte', icon: CreditCard, color: 'bg-blue-100 text-blue-700' },
  { value: 'VISA', label: 'Visa', icon: FileText, color: 'bg-green-100 text-green-700' },
  { value: 'TICKET', label: 'Ticket', icon: Plane, color: 'bg-purple-100 text-purple-700' },
  { value: 'RESERVATION', label: 'Reserva', icon: Home, color: 'bg-orange-100 text-orange-700' },
  { value: 'INSURANCE', label: 'Seguro', icon: Shield, color: 'bg-red-100 text-red-700' },
  { value: 'OTHER', label: 'Otros', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700' },
];

export function DocumentForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading, 
  mode 
}: DocumentFormProps) {
  const [uploadingFile, setUploadingFile] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(
    initialData?.fileUrl || null
  );
  const [isDragOver, setIsDragOver] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type as any || 'PASSPORT',
      fileUrl: initialData?.fileUrl || '',
      fileType: initialData?.fileType || '',
      fileSize: initialData?.fileSize || 0,
      expiryDate: initialData?.expiryDate ? 
        new Date(initialData.expiryDate).toISOString().slice(0, 10) : '',
      notes: initialData?.notes || '',
    },
  });

  const type = watch('type');
  const fileUrl = watch('fileUrl');

  const handleFormSubmit = async (data: DocumentFormData) => {
    try {
      // Transform data for API
      const submitData = {
        ...data,
        expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString() : undefined,
      };

      await onSubmit(submitData);
      reset();
      setFilePreview(null);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Solo PDF, JPG, PNG y GIF.');
      return;
    }

    setUploadingFile(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload file to our API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al subir archivo');
      }

      const uploadResult = await response.json();
      
      setValue('fileUrl', uploadResult.fileUrl);
      setValue('fileType', uploadResult.fileType);
      setValue('fileSize', uploadResult.fileSize);
      setFilePreview(uploadResult.fileUrl);
      
      // If no name is set, use the file name (without extension)
      if (!watch('name')) {
        setValue('name', uploadResult.fileName.replace(/\.[^/.]+$/, ""));
      }
      
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert(error.message || 'Error al subir el archivo. Inténtalo de nuevo.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const getTypeData = (documentType: string) => {
    return documentTypes.find(t => t.value === documentType) || documentTypes[0];
  };

  const typeData = getTypeData(type);
  const TypeIcon = typeData.icon;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow && expiry >= new Date();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Document Name and Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del documento *</Label>
          <div className="flex items-center gap-2">
            <TypeIcon className="h-5 w-5 text-gray-400" />
            <Input
              id="name"
              {...register('name')}
              placeholder="Ej: Pasaporte Juan Pérez"
              className={`flex-1 ${errors.name ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo de documento *</Label>
          <Select
            value={type}
            onValueChange={(value) => setValue('type', value as any)}
          >
            <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((docType) => {
                const Icon = docType.icon;
                return (
                  <SelectItem key={docType.value} value={docType.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {docType.label}
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

      {/* File Upload */}
      <div className="space-y-2">
        <Label htmlFor="file">Archivo del documento *</Label>
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {filePreview ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                {watch('fileType')?.startsWith('image/') ? (
                  <div className="relative">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg border"
                      onError={() => {
                        // Fallback to file icon if image fails to load
                        const img = document.querySelector('img[alt="Preview"]') as HTMLImageElement;
                        if (img) {
                          img.style.display = 'none';
                          img.nextElementSibling?.classList.remove('hidden');
                        }
                      }}
                    />
                    <File className="h-32 w-32 text-blue-600 hidden" />
                  </div>
                ) : (
                  <File className="h-16 w-16 text-blue-600" />
                )}
                <div className="text-center">
                  <p className="font-medium text-gray-900">Archivo cargado</p>
                  <p className="text-sm text-gray-600">
                    {watch('fileType')} • {formatFileSize(watch('fileSize') || 0)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(filePreview, '_blank')}
                >
                  Ver archivo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilePreview(null);
                    setValue('fileUrl', '');
                    setValue('fileType', '');
                    setValue('fileSize', 0);
                  }}
                >
                  Cambiar archivo
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-8 w-8 text-gray-400 mx-auto" />
              <div>
                <p className="text-gray-600">Arrastra un archivo aquí o</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={uploadingFile}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  {uploadingFile ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Seleccionar archivo
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                PDF, JPG, PNG o GIF hasta 10MB
              </p>
            </div>
          )}
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.gif"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        {errors.fileUrl && (
          <p className="text-sm text-red-500">{errors.fileUrl.message}</p>
        )}
      </div>

      {/* Hidden form fields for file data */}
      <input type="hidden" {...register('fileUrl')} />
      <input type="hidden" {...register('fileType')} />
      <input type="hidden" {...register('fileSize', { valueAsNumber: true })} />

      {/* Expiry Date */}
      <div className="space-y-2">
        <Label htmlFor="expiryDate">Fecha de vencimiento</Label>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <Input
            id="expiryDate"
            {...register('expiryDate')}
            type="date"
            className={`flex-1 ${errors.expiryDate ? 'border-red-500' : ''}`}
          />
        </div>
        {watch('expiryDate') && isExpiringSoon(watch('expiryDate')) && (
          <div className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm">Este documento vence pronto</p>
          </div>
        )}
        {errors.expiryDate && (
          <p className="text-sm text-red-500">{errors.expiryDate.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Información adicional sobre este documento..."
          className="min-h-20"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || uploadingFile}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || uploadingFile || !fileUrl}
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {mode === 'create' ? 'Subir Documento' : 'Actualizar Documento'}
        </Button>
      </div>
    </form>
  );
}