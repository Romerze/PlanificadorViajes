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
  Building2,
  Home,
  MapPin,
  Calendar,
  Star,
  Loader2,
  Edit,
  Trash2,
  DollarSign,
  ExternalLink,
  Clock
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
import { AccommodationForm } from '@/components/accommodation/accommodation-form';

interface Trip {
  id: string;
  name: string;
  destination: string;
}

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

const accommodationTypes = [
  { value: 'HOTEL', label: 'Hotel', icon: Building2, color: 'bg-blue-100 text-blue-700' },
  { value: 'HOSTEL', label: 'Hostal', icon: Building2, color: 'bg-purple-100 text-purple-700' },
  { value: 'AIRBNB', label: 'Airbnb', icon: Home, color: 'bg-pink-100 text-pink-700' },
  { value: 'APARTMENT', label: 'Apartamento', icon: Home, color: 'bg-green-100 text-green-700' },
  { value: 'HOUSE', label: 'Casa', icon: Home, color: 'bg-yellow-100 text-yellow-700' },
  { value: 'OTHER', label: 'Otro', icon: Building2, color: 'bg-gray-100 text-gray-700' },
];

export default function AccommodationPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [accommodation, setAccommodation] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAccommodation, setEditingAccommodation] = useState<Accommodation | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Load data
  useEffect(() => {
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

        // Fetch accommodation
        const params_url = new URLSearchParams();
        if (searchTerm) params_url.append('search', searchTerm);
        if (typeFilter && typeFilter !== 'all') params_url.append('type', typeFilter);
        
        const accommodationResponse = await fetch(`/api/trips/${params.id}/accommodation?${params_url.toString()}`);
        if (!accommodationResponse.ok) {
          throw new Error('Error al cargar hospedajes');
        }
        const accommodationData = await accommodationResponse.json();
        setAccommodation(accommodationData.accommodation || []);
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

    fetchData();
  }, [params.id, session, toast, searchTerm, typeFilter]);

  // Authentication checks
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/auth/signin');
    return null;
  }

  // Create accommodation
  const handleCreateAccommodation = async (data: any) => {
    setFormLoading(true);
    try {
      const response = await fetch(`/api/trips/${params.id}/accommodation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear hospedaje');
      }

      const newAccommodation = await response.json();
      setAccommodation(prev => [newAccommodation, ...prev].sort((a, b) => 
        new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime()
      ));
      setShowCreateForm(false);
      
      toast({
        title: 'Éxito',
        description: 'Hospedaje creado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear hospedaje',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Update accommodation
  const handleUpdateAccommodation = async (data: any) => {
    if (!editingAccommodation) return;
    
    setFormLoading(true);
    try {
      const response = await fetch(`/api/trips/${params.id}/accommodation/${editingAccommodation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar hospedaje');
      }

      const updatedAccommodation = await response.json();
      setAccommodation(prev => prev.map(acc => 
        acc.id === editingAccommodation.id ? updatedAccommodation : acc
      ).sort((a, b) => 
        new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime()
      ));
      setEditingAccommodation(null);
      
      toast({
        title: 'Éxito',
        description: 'Hospedaje actualizado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar hospedaje',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Delete accommodation
  const handleDeleteAccommodation = async (accommodationId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este hospedaje?')) return;
    
    try {
      const response = await fetch(`/api/trips/${params.id}/accommodation/${accommodationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar hospedaje');
      }

      setAccommodation(prev => prev.filter(acc => acc.id !== accommodationId));
      
      toast({
        title: 'Éxito',
        description: 'Hospedaje eliminado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar hospedaje',
        variant: 'destructive',
      });
    }
  };

  // Get accommodation type data
  const getAccommodationType = (type: string) => {
    return accommodationTypes.find(t => t.value === type) || accommodationTypes[0];
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get stay duration
  const getStayDuration = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format price
  const formatPrice = (price: number | string, currency: string) => {
    const numPrice = typeof price === 'number' ? price : parseFloat(price.toString());
    return `${currency} ${numPrice.toFixed(2)}`;
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
            <h1 className="text-3xl font-bold text-gray-900">Hospedajes</h1>
            <p className="text-gray-600 mt-1">{trip.name} - {trip.destination}</p>
          </div>

          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Hospedaje
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar hospedajes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {accommodationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Accommodation List */}
        {accommodation.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">
                No hay hospedajes aún
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza agregando los hospedajes de tu viaje
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear primer hospedaje
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {accommodation.map((acc) => {
              const typeData = getAccommodationType(acc.type);
              const Icon = typeData.icon;
              const duration = getStayDuration(acc.checkInDate, acc.checkOutDate);
              
              return (
                <Card key={acc.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${typeData.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-xl text-gray-300 mb-1">
                            {acc.name}
                          </h3>
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary">
                              {typeData.label}
                            </Badge>
                            {acc.rating && (
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < acc.rating!
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="text-sm text-gray-600 ml-1">({acc.rating}/5)</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{acc.address}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingAccommodation(acc)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAccommodation(acc.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Check-in */}
                      <div className="text-center">
                        <p className="text-sm text-gray-400 mb-1">Check-in</p>
                        <p className="font-semibold text-gray-500">{formatDate(acc.checkInDate)}</p>
                      </div>
                      
                      {/* Check-out */}
                      <div className="text-center">
                        <p className="text-sm text-gray-400 mb-1">Check-out</p>
                        <p className="font-semibold text-gray-500">{formatDate(acc.checkOutDate)}</p>
                      </div>

                      {/* Duration */}
                      <div className="text-center">
                        <p className="text-sm text-gray-400 mb-1">Duración</p>
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold text-gray-500">{duration} noches</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-center">
                        {acc.totalPrice && (
                          <>
                            <p className="text-sm text-gray-400 mb-1">Precio total</p>
                            <div className="flex items-center justify-center gap-1">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                              <span className="font-semibold text-gray-500">
                                {formatPrice(acc.totalPrice, acc.currency || 'PEN')}
                              </span>
                            </div>
                            {acc.pricePerNight && (
                              <p className="text-xs text-gray-400 mt-1">
                                {formatPrice(acc.pricePerNight, acc.currency || 'PEN')} por noche
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Additional info */}
                    {(acc.confirmationCode || acc.bookingUrl || acc.notes) && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {acc.confirmationCode && (
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Confirmación</p>
                              <p className="font-medium text-gray-500">{acc.confirmationCode}</p>
                            </div>
                          )}
                          
                          {acc.bookingUrl && (
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Reserva</p>
                              <a 
                                href={acc.bookingUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                              >
                                <span className="text-sm">Ver reserva</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                          
                          {acc.notes && (
                            <div className="md:col-span-3">
                              <p className="text-sm text-gray-400 mb-1">Notas</p>
                              <p className="text-gray-500 text-sm">{acc.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Accommodation Dialog */}
      <Dialog open={showCreateForm || !!editingAccommodation} onOpenChange={(open) => {
        if (!open) {
          setShowCreateForm(false);
          setEditingAccommodation(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAccommodation ? 'Editar Hospedaje' : 'Nuevo Hospedaje'}
            </DialogTitle>
          </DialogHeader>
          <AccommodationForm
            initialData={editingAccommodation || undefined}
            onSubmit={editingAccommodation ? handleUpdateAccommodation : handleCreateAccommodation}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingAccommodation(null);
            }}
            isLoading={formLoading}
            mode={editingAccommodation ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}