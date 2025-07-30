'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Plus,
  Search,
  Calendar,
  MapPin,
  Loader2,
  Image as ImageIcon,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PhotoUpload } from '@/components/photos/photo-upload';
import { PhotoGallery } from '@/components/photos/photo-gallery';

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
}

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

interface PhotoStatistics {
  total: number;
  withLocation: number;
  byItinerary: Array<{
    itineraryId: string | null;
    count: number;
  }>;
}

export default function PhotosPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [statistics, setStatistics] = useState<PhotoStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [itineraryFilter, setItineraryFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Load data
  const fetchData = async () => {
    if (!session) return;
    
    try {
      // Fetch trip details
      const tripResponse = await fetch(`/api/trips/${params.id}`);
      if (!tripResponse.ok) {
        throw new Error('Error al cargar el viaje');
      }
      const tripData = await tripResponse.json();
      setTrip(tripData);

      // Fetch photos with filters
      const photoParams = new URLSearchParams();
      if (itineraryFilter && itineraryFilter !== 'all') photoParams.append('itineraryId', itineraryFilter);
      if (activityFilter && activityFilter !== 'all') photoParams.append('activityId', activityFilter);
      if (dateFilter) photoParams.append('date', dateFilter);
      
      const photosResponse = await fetch(`/api/trips/${params.id}/photos?${photoParams.toString()}`);
      if (!photosResponse.ok) {
        throw new Error('Error al cargar fotos');
      }
      const photosData = await photosResponse.json();
      setPhotos(photosData.photos || []);
      setStatistics(photosData.statistics);

      // Fetch itineraries for filters
      const itinerariesResponse = await fetch(`/api/trips/${params.id}/itinerary`);
      if (itinerariesResponse.ok) {
        const itinerariesData = await itinerariesResponse.json();
        setItineraries(itinerariesData.itineraries || []);
      }

      // Fetch activities for filters
      const activitiesResponse = await fetch(`/api/trips/${params.id}/activities`);
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData.activities || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id, session, toast, itineraryFilter, activityFilter, dateFilter]);

  // Authentication checks
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/auth/signin');
    return null;
  }

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Filter photos based on search
  const filteredPhotos = photos.filter(photo => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      photo.caption?.toLowerCase().includes(searchLower) ||
      photo.activity?.name.toLowerCase().includes(searchLower)
    );
  });

  // CRUD operations
  const handleUploadComplete = async (uploadedPhotos: Photo[]) => {
    setShowUploadForm(false);
    await fetchData();
    
    toast({
      title: 'Éxito',
      description: `${uploadedPhotos.length} foto(s) subida(s) exitosamente`,
    });
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta foto?')) return;
    
    try {
      const response = await fetch(`/api/trips/${params.id}/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar foto');
      }

      await fetchData();
      
      toast({
        title: 'Éxito',
        description: 'Foto eliminada exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar foto',
        variant: 'destructive',
      });
    }
  };

  const downloadAllPhotos = async () => {
    // This would need to be implemented with a zip library
    toast({
      title: 'Función pendiente',
      description: 'La descarga masiva estará disponible pronto',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="hover:bg-gray-50 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Fotos</h1>
            <p className="text-gray-600 mt-1">{trip.name} - {trip.destination}</p>
          </div>

          <div className="flex items-center gap-2">
            {photos.length > 0 && (
              <Button
                variant="outline"
                onClick={downloadAllPhotos}
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar todas
              </Button>
            )}
            <Button
              onClick={() => setShowUploadForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Subir fotos
            </Button>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Total Fotos</p>
                    <p className="text-2xl font-bold text-gray-500">{statistics.total}</p>
                  </div>
                  <ImageIcon className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Con Ubicación</p>
                    <p className="text-2xl font-bold text-green-600">{statistics.withLocation}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Días con Fotos</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {statistics.byItinerary.filter(item => item.itineraryId).length}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Promedio por Día</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {statistics.byItinerary.length > 0 
                        ? Math.round(statistics.total / statistics.byItinerary.filter(item => item.itineraryId).length) 
                        : 0}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar fotos por descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={itineraryFilter} onValueChange={setItineraryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por día" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los días</SelectItem>
                {itineraries.map((itinerary) => (
                  <SelectItem key={itinerary.id} value={itinerary.id}>
                    {formatDate(itinerary.date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={activityFilter} onValueChange={setActivityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por actividad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las actividades</SelectItem>
                {activities.map((activity) => (
                  <SelectItem key={activity.id} value={activity.id}>
                    {activity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-48"
              placeholder="Filtrar por fecha"
            />
          </div>
        </div>

        {/* Active filters */}
        {(itineraryFilter !== 'all' || activityFilter !== 'all' || dateFilter || searchTerm) && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-gray-600">Filtros activos:</span>
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Búsqueda: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
            {itineraryFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Día: {formatDate(itineraries.find(i => i.id === itineraryFilter)?.date || '')}
                <button
                  onClick={() => setItineraryFilter('all')}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
            {activityFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Actividad: {activities.find(a => a.id === activityFilter)?.name}
                <button
                  onClick={() => setActivityFilter('all')}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
            {dateFilter && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Fecha: {formatDate(dateFilter)}
                <button
                  onClick={() => setDateFilter('')}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Photos Gallery */}
        <PhotoGallery
          photos={filteredPhotos}
          onDelete={handleDeletePhoto}
        />
      </div>

      {/* Upload Photos Dialog */}
      <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subir Fotos</DialogTitle>
          </DialogHeader>
          <PhotoUpload
            tripId={params.id}
            itineraries={itineraries}
            activities={activities}
            onUploadComplete={handleUploadComplete}
            onCancel={() => setShowUploadForm(false)}
            isLoading={formLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}