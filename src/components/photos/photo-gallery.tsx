'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Eye,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Itinerary {
  id: string;
  date: string;
}

interface Activity {
  id: string;
  name: string;
  category: string;
}

interface Photo {
  id: string;
  fileUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  takenAt?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  itinerary?: Itinerary;
  activity?: Activity;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onEdit?: (photo: Photo) => void;
  onDelete?: (photoId: string) => void;
  isLoading?: boolean;
}

export function PhotoGallery({ 
  photos, 
  onEdit, 
  onDelete,
  isLoading = false 
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openLightbox = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
    setCurrentIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  const goToNext = () => {
    const newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  const handleDownload = async (photo: Photo) => {
    try {
      const response = await fetch(photo.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `foto-${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading photo:', error);
    }
  };

  const openInNewTab = (photo: Photo) => {
    window.open(photo.fileUrl, '_blank');
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'CULTURAL': 'bg-purple-100 text-purple-700',
      'FOOD': 'bg-orange-100 text-orange-700',
      'NATURE': 'bg-green-100 text-green-700',
      'ADVENTURE': 'bg-red-100 text-red-700',
      'SHOPPING': 'bg-pink-100 text-pink-700',
      'ENTERTAINMENT': 'bg-blue-100 text-blue-700',
      'OTHER': 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors['OTHER'];
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No hay fotos aún
        </h3>
        <p className="text-gray-600">
          Sube tus primeras fotos para crear tu álbum de viaje
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <Card key={photo.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              {/* Image */}
              <div className="relative aspect-square">
                <img
                  src={photo.thumbnailUrl || photo.fileUrl}
                  alt={photo.caption || 'Foto de viaje'}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openLightbox(photo, index)}
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openLightbox(photo, index)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(photo)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onEdit(photo)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onDelete(photo.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Date badge */}
                {photo.takenAt && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      {formatDate(photo.takenAt)}
                    </Badge>
                  </div>
                )}

                {/* Location indicator */}
                {photo.latitude && photo.longitude && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-blue-500 text-white rounded-full p-1">
                      <MapPin className="h-3 w-3" />
                    </div>
                  </div>
                )}
              </div>

              {/* Photo info */}
              <div className="p-3">
                {photo.caption && (
                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                    {photo.caption}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDate(photo.createdAt)}</span>
                  
                  <div className="flex items-center gap-2">
                    {photo.itinerary && (
                      <Badge variant="outline" className="text-xs">
                        Día {formatDate(photo.itinerary.date)}
                      </Badge>
                    )}
                    
                    {photo.activity && (
                      <Badge className={`text-xs ${getCategoryColor(photo.activity.category)}`}>
                        {photo.activity.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => closeLightbox()}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <div className="relative">
              {/* Header */}
              <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 text-white p-4">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-white">
                    {selectedPhoto.caption || 'Foto de viaje'}
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openInNewTab(selectedPhoto)}
                      className="text-white hover:bg-white hover:bg-opacity-20"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(selectedPhoto)}
                      className="text-white hover:bg-white hover:bg-opacity-20"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closeLightbox}
                      className="text-white hover:bg-white hover:bg-opacity-20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              {/* Navigation arrows */}
              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Image */}
              <div className="flex items-center justify-center bg-black">
                <img
                  src={selectedPhoto.fileUrl}
                  alt={selectedPhoto.caption || 'Foto de viaje'}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>

              {/* Footer with metadata */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    {selectedPhoto.takenAt && (
                      <p><strong>Tomada:</strong> {formatDateTime(selectedPhoto.takenAt)}</p>
                    )}
                    <p><strong>Subida:</strong> {formatDateTime(selectedPhoto.createdAt)}</p>
                  </div>
                  
                  <div>
                    {selectedPhoto.itinerary && (
                      <p><strong>Día:</strong> {formatDate(selectedPhoto.itinerary.date)}</p>
                    )}
                    {selectedPhoto.activity && (
                      <p><strong>Actividad:</strong> {selectedPhoto.activity.name}</p>
                    )}
                  </div>
                  
                  <div>
                    {selectedPhoto.latitude && selectedPhoto.longitude && (
                      <p>
                        <strong>Ubicación:</strong> {Number(selectedPhoto.latitude).toFixed(6)}, {Number(selectedPhoto.longitude).toFixed(6)}
                      </p>
                    )}
                    <p><strong>Foto:</strong> {currentIndex + 1} de {photos.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}