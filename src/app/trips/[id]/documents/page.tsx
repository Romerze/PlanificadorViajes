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
  FileText,
  Download,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  Calendar,
  File,
  CreditCard,
  Plane,
  Home,
  Shield,
  MoreHorizontal,
  ExternalLink,
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
import { DocumentForm } from '@/components/documents/document-form';

interface Trip {
  id: string;
  name: string;
  destination: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  expiryDate?: string;
  notes?: string;
  createdAt: string;
}

interface DocumentStatistics {
  total: number;
  byType: Array<{
    type: string;
    count: number;
  }>;
  expiring: number;
  expiringDocuments: Array<{
    id: string;
    name: string;
    type: string;
    expiryDate: string;
  }>;
}

const documentTypes = [
  { value: 'PASSPORT', label: 'Pasaporte', icon: CreditCard, color: 'bg-blue-100 text-blue-700' },
  { value: 'VISA', label: 'Visa', icon: FileText, color: 'bg-green-100 text-green-700' },
  { value: 'TICKET', label: 'Ticket', icon: Plane, color: 'bg-purple-100 text-purple-700' },
  { value: 'RESERVATION', label: 'Reserva', icon: Home, color: 'bg-orange-100 text-orange-700' },
  { value: 'INSURANCE', label: 'Seguro', icon: Shield, color: 'bg-red-100 text-red-700' },
  { value: 'OTHER', label: 'Otros', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700' },
];

export default function DocumentsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [statistics, setStatistics] = useState<DocumentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
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

      // Fetch documents
      const documentParams = new URLSearchParams();
      if (searchTerm) documentParams.append('search', searchTerm);
      if (typeFilter && typeFilter !== 'all') documentParams.append('type', typeFilter);
      
      const documentsResponse = await fetch(`/api/trips/${params.id}/documents?${documentParams.toString()}`);
      if (!documentsResponse.ok) {
        throw new Error('Error al cargar documentos');
      }
      const documentsData = await documentsResponse.json();
      setDocuments(documentsData.documents || []);
      setStatistics(documentsData.statistics);
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
  }, [params.id, session, toast, searchTerm, typeFilter]);

  // Authentication checks
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/auth/signin');
    return null;
  }

  // Helper functions
  const getTypeData = (type: string) => {
    return documentTypes.find(t => t.value === type) || documentTypes[0];
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow && expiry >= new Date();
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  // CRUD operations
  const handleCreateDocument = async (data: any) => {
    setFormLoading(true);
    try {
      const response = await fetch(`/api/trips/${params.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al subir documento');
      }

      setShowCreateForm(false);
      await fetchData();
      
      toast({
        title: 'Éxito',
        description: 'Documento subido exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al subir documento',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateDocument = async (data: any) => {
    if (!editingDocument) return;
    
    setFormLoading(true);
    try {
      const response = await fetch(`/api/trips/${params.id}/documents/${editingDocument.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar documento');
      }

      setEditingDocument(null);
      await fetchData();
      
      toast({
        title: 'Éxito',
        description: 'Documento actualizado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar documento',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) return;
    
    try {
      const response = await fetch(`/api/trips/${params.id}/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar documento');
      }

      await fetchData();
      
      toast({
        title: 'Éxito',
        description: 'Documento eliminado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar documento',
        variant: 'destructive',
      });
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
            <p className="text-gray-600 mt-1">{trip.name} - {trip.destination}</p>
          </div>

          <div className="flex items-center gap-2">
            {documents.some(doc => doc.fileUrl.startsWith('https://example.com')) && (
              <Button
                onClick={() => {
                  if (confirm('¿Eliminar todos los documentos de prueba? Esta acción no se puede deshacer.')) {
                    const testDocs = documents.filter(doc => doc.fileUrl.startsWith('https://example.com'));
                    Promise.all(testDocs.map(doc => handleDeleteDocument(doc.id)));
                  }
                }}
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Datos de Prueba
              </Button>
            )}
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Subir Documento
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
                    <p className="text-sm text-gray-300">Total Documentos</p>
                    <p className="text-2xl font-bold text-gray-500">{statistics.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Por Vencer</p>
                    <p className="text-2xl font-bold text-orange-600">{statistics.expiring}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Más Común</p>
                    <p className="text-lg font-bold text-gray-500">
                      {statistics.byType.length > 0 
                        ? getTypeData(statistics.byType.reduce((a, b) => a.count > b.count ? a : b).type).label
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <File className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Tamaño Total</p>
                    <p className="text-lg font-bold text-gray-500">
                      {formatFileSize(documents.reduce((sum, doc) => sum + doc.fileSize, 0))}
                    </p>
                  </div>
                  <Download className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}


        {/* Test Data Alert - Only show for actual example.com URLs */}
        {documents.some(doc => doc.fileUrl.startsWith('https://example.com')) && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium text-red-800">
                    Tienes documentos con datos de prueba
                  </p>
                  <p className="text-sm text-red-600">
                    Estos documentos no se pueden ver ni descargar. Elimínalos y sube archivos reales.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm('¿Eliminar todos los documentos de prueba? Esta acción no se puede deshacer.')) {
                      const testDocs = documents.filter(doc => doc.fileUrl.startsWith('https://example.com'));
                      Promise.all(testDocs.map(doc => handleDeleteDocument(doc.id)));
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Limpiar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expiring Documents Alert */}
        {statistics && statistics.expiring > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">
                    Tienes {statistics.expiring} documento(s) que vencen pronto
                  </p>
                  <p className="text-sm text-orange-600">
                    {statistics.expiringDocuments.map(doc => doc.name).join(', ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar documentos..."
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
              {documentTypes.map((type) => (
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

        {/* Documents List */}
        {documents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">
                No hay documentos aún
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza subiendo los documentos importantes de tu viaje
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Subir primer documento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => {
              const typeData = getTypeData(doc.type);
              const Icon = typeData.icon;
              const hasExpiry = doc.expiryDate;
              const expiringSoon = hasExpiry && isExpiringSoon(doc.expiryDate!);
              const expired = hasExpiry && isExpired(doc.expiryDate!);
              
              return (
                <Card key={doc.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-3 rounded-lg ${typeData.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-300 mb-1 truncate">
                            {doc.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">
                              {typeData.label}
                            </Badge>
                            {doc.fileUrl.startsWith('https://example.com') && (
                              <Badge variant="destructive" className="text-xs">
                                Datos de prueba
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {doc.fileType} • {formatFileSize(doc.fileSize)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (doc.fileUrl.startsWith('https://example.com')) {
                              toast({
                                title: 'Error',
                                description: 'Este documento fue creado con datos de prueba. Por favor, elimínalo y sube el archivo real.',
                                variant: 'destructive',
                              });
                              return;
                            }
                            window.open(doc.fileUrl, '_blank');
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingDocument(doc)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expiry Information */}
                    {hasExpiry && (
                      <div className={`flex items-center gap-2 mb-3 ${expired ? 'text-red-600' : expiringSoon ? 'text-orange-600' : 'text-gray-600'}`}>
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {expired ? 'Vencido el' : 'Vence el'} {formatDate(doc.expiryDate!)}
                        </span>
                        {(expired || expiringSoon) && (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {doc.notes && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {doc.notes}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (doc.fileUrl.startsWith('https://example.com')) {
                            toast({
                              title: 'Error',
                              description: 'Este documento fue creado con datos de prueba. Por favor, elimínalo y sube el archivo real.',
                              variant: 'destructive',
                            });
                            return;
                          }
                          window.open(doc.fileUrl, '_blank');
                        }}
                        className="flex-1"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            // Check if the file URL is valid (not a mock URL)
                            if (doc.fileUrl.startsWith('https://example.com')) {
                              toast({
                                title: 'Error',
                                description: 'Este documento fue creado con datos de prueba. Por favor, elimínalo y sube el archivo real.',
                                variant: 'destructive',
                              });
                              return;
                            }
                            
                            // Extract the original filename from the URL or use document name with proper extension
                            const urlParts = doc.fileUrl.split('/');
                            const fileName = urlParts[urlParts.length - 1];
                            const fileExtension = fileName.split('.').pop();
                            const downloadName = doc.name.includes('.') ? doc.name : `${doc.name}.${fileExtension}`;
                            
                            // Fetch the file as blob
                            const response = await fetch(doc.fileUrl);
                            if (!response.ok) throw new Error('Error al descargar archivo');
                            
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = downloadName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            
                            // Clean up the blob URL
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error('Error downloading file:', error);
                            toast({
                              title: 'Error',
                              description: 'No se pudo descargar el archivo. Verifica que el archivo existe.',
                              variant: 'destructive',
                            });
                          }
                        }}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Document Dialog */}
      <Dialog open={showCreateForm || !!editingDocument} onOpenChange={(open) => {
        if (!open) {
          setShowCreateForm(false);
          setEditingDocument(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDocument ? 'Editar Documento' : 'Subir Nuevo Documento'}
            </DialogTitle>
          </DialogHeader>
          <DocumentForm
            initialData={editingDocument || undefined}
            onSubmit={editingDocument ? handleUpdateDocument : handleCreateDocument}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingDocument(null);
            }}
            isLoading={formLoading}
            mode={editingDocument ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}