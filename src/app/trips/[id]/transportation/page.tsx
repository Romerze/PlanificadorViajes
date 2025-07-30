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
  Plane,
  Bus,
  Train,
  Car,
  Ship,
  Clock,
  MapPin,
  Loader2,
  Edit,
  Trash2,
  Calendar,
  DollarSign
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
import { TransportationForm } from '@/components/transportation/transportation-form';

interface Trip {
  id: string;
  name: string;
  destination: string;
}

interface Transportation {
  id: string;
  type: string;
  company?: string;
  departureLocation: string;
  arrivalLocation: string;
  departureDatetime: string;
  arrivalDatetime: string;
  confirmationCode?: string;
  price?: number;
  currency?: string;
  notes?: string;
}

const transportationTypes = [
  { value: 'FLIGHT', label: 'Vuelo', icon: Plane, color: 'bg-blue-100 text-blue-700' },
  { value: 'BUS', label: 'Bus', icon: Bus, color: 'bg-green-100 text-green-700' },
  { value: 'TRAIN', label: 'Tren', icon: Train, color: 'bg-purple-100 text-purple-700' },
  { value: 'CAR', label: 'Auto', icon: Car, color: 'bg-yellow-100 text-yellow-700' },
  { value: 'BOAT', label: 'Barco', icon: Ship, color: 'bg-cyan-100 text-cyan-700' },
  { value: 'OTHER', label: 'Otro', icon: Car, color: 'bg-gray-100 text-gray-700' },
];

export default function TransportationPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [transportation, setTransportation] = useState<Transportation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTransportation, setEditingTransportation] = useState<Transportation | null>(null);
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

        // Fetch transportation
        const params_url = new URLSearchParams();
        if (searchTerm) params_url.append('search', searchTerm);
        if (typeFilter && typeFilter !== 'all') params_url.append('type', typeFilter);
        
        const transportationResponse = await fetch(`/api/trips/${params.id}/transportation?${params_url.toString()}`);
        if (!transportationResponse.ok) {
          throw new Error('Error al cargar transportes');
        }
        const transportationData = await transportationResponse.json();
        setTransportation(transportationData.transportation || []);
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

  // Create transportation
  const handleCreateTransportation = async (data: any) => {
    setFormLoading(true);
    try {
      const response = await fetch(`/api/trips/${params.id}/transportation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear transporte');
      }

      const newTransportation = await response.json();
      setTransportation(prev => [newTransportation, ...prev].sort((a, b) => 
        new Date(a.departureDatetime).getTime() - new Date(b.departureDatetime).getTime()
      ));
      setShowCreateForm(false);
      
      toast({
        title: 'Éxito',
        description: 'Transporte creado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear transporte',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Update transportation
  const handleUpdateTransportation = async (data: any) => {
    if (!editingTransportation) return;
    
    setFormLoading(true);
    try {
      const response = await fetch(`/api/trips/${params.id}/transportation/${editingTransportation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar transporte');
      }

      const updatedTransportation = await response.json();
      setTransportation(prev => prev.map(transport => 
        transport.id === editingTransportation.id ? updatedTransportation : transport
      ).sort((a, b) => 
        new Date(a.departureDatetime).getTime() - new Date(b.departureDatetime).getTime()
      ));
      setEditingTransportation(null);
      
      toast({
        title: 'Éxito',
        description: 'Transporte actualizado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar transporte',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Delete transportation
  const handleDeleteTransportation = async (transportationId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este transporte?')) return;
    
    try {
      const response = await fetch(`/api/trips/${params.id}/transportation/${transportationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar transporte');
      }

      setTransportation(prev => prev.filter(transport => transport.id !== transportationId));
      
      toast({
        title: 'Éxito',
        description: 'Transporte eliminado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar transporte',
        variant: 'destructive',
      });
    }
  };

  // Get transport type data
  const getTransportType = (type: string) => {
    return transportationTypes.find(t => t.value === type) || transportationTypes[0];
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format duration
  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
            <h1 className="text-3xl font-bold text-gray-900">Transportes</h1>
            <p className="text-gray-600 mt-1">{trip.name} - {trip.destination}</p>
          </div>

          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Transporte
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar transportes..."
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
              {transportationTypes.map((type) => (
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

        {/* Transportation Timeline */}
        {transportation.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay transportes aún
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza agregando los transportes de tu viaje
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear primer transporte
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {transportation.map((transport, index) => {
              const typeData = getTransportType(transport.type);
              const Icon = typeData.icon;
              
              return (
                <Card key={transport.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${typeData.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-300">
                            {transport.company || typeData.label}
                          </h3>
                          <Badge variant="secondary" className="mt-1">
                            {typeData.label}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingTransportation(transport)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTransportation(transport.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Route */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <p className="text-sm text-gray-400">Salida</p>
                            <p className="font-semibold text-gray-500">{transport.departureLocation}</p>
                            <p className="text-sm text-blue-600">{formatDateTime(transport.departureDatetime)}</p>
                          </div>
                          
                          <div className="flex-1 px-4">
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                              </div>
                              <div className="relative flex justify-center">
                                <div className="bg-gray-50 px-3 py-1 rounded-full">
                                  <span className="text-sm text-gray-700">
                                    {getDuration(transport.departureDatetime, transport.arrivalDatetime)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm text-gray-400">Llegada</p>
                            <p className="font-semibold text-gray-500">{transport.arrivalLocation}</p>
                            <p className="text-sm text-green-600">{formatDateTime(transport.arrivalDatetime)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-3">
                        {transport.confirmationCode && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">Confirmación:</span>
                            <span className="font-medium text-gray-500">{transport.confirmationCode}</span>
                          </div>
                        )}
                        
                        {transport.price && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-500">
                              {formatPrice(transport.price, transport.currency || 'PEN')}
                            </span>
                          </div>
                        )}

                        {transport.notes && (
                          <div className="text-sm">
                            <p className="text-gray-400 mb-1">Notas:</p>
                            <p className="text-gray-500">{transport.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Transportation Dialog */}
      <Dialog open={showCreateForm || !!editingTransportation} onOpenChange={(open) => {
        if (!open) {
          setShowCreateForm(false);
          setEditingTransportation(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTransportation ? 'Editar Transporte' : 'Nuevo Transporte'}
            </DialogTitle>
          </DialogHeader>
          <TransportationForm
            initialData={editingTransportation || undefined}
            onSubmit={editingTransportation ? handleUpdateTransportation : handleCreateTransportation}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingTransportation(null);
            }}
            isLoading={formLoading}
            mode={editingTransportation ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}