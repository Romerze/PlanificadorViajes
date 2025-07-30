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
  AlertTriangle,
  Lightbulb,
  Bell,
  Loader2,
  Calendar,
  Filter,
  BookOpen
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
import { NoteForm } from '@/components/notes/note-form';
import { NoteCard } from '@/components/notes/note-card';

interface Trip {
  id: string;
  name: string;
  destination: string;
}

interface Note {
  id: string;
  title?: string;
  content: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface NoteStatistics {
  total: number;
  recent: number;
  byType: Array<{
    type: string;
    count: number;
  }>;
}

const noteTypes = [
  { 
    value: 'GENERAL', 
    label: 'General', 
    icon: FileText, 
    color: 'bg-gray-100 text-gray-700'
  },
  { 
    value: 'IMPORTANT', 
    label: 'Importante', 
    icon: AlertTriangle, 
    color: 'bg-red-100 text-red-700'
  },
  { 
    value: 'REMINDER', 
    label: 'Recordatorio', 
    icon: Bell, 
    color: 'bg-orange-100 text-orange-700'
  },
  { 
    value: 'IDEA', 
    label: 'Idea', 
    icon: Lightbulb, 
    color: 'bg-yellow-100 text-yellow-700'
  },
];

export default function NotesPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [statistics, setStatistics] = useState<NoteStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
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

      // Fetch notes with filters
      const noteParams = new URLSearchParams();
      if (searchTerm) noteParams.append('search', searchTerm);
      if (typeFilter && typeFilter !== 'all') noteParams.append('type', typeFilter);
      
      const notesResponse = await fetch(`/api/trips/${params.id}/notes?${noteParams.toString()}`);
      if (!notesResponse.ok) {
        throw new Error('Error al cargar notas');
      }
      const notesData = await notesResponse.json();
      setNotes(notesData.notes || []);
      setStatistics(notesData.statistics);
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
    return noteTypes.find(t => t.value === type) || noteTypes[0];
  };

  // Filter notes based on search (already handled by API, but keeping for consistency)
  const filteredNotes = notes;

  // CRUD operations
  const handleCreateNote = async (data: any) => {
    setFormLoading(true);
    try {
      const response = await fetch(`/api/trips/${params.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear nota');
      }

      setShowCreateForm(false);
      await fetchData();
      
      toast({
        title: 'Éxito',
        description: 'Nota creada exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear nota',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateNote = async (data: any) => {
    if (!editingNote) return;
    
    setFormLoading(true);
    try {
      const response = await fetch(`/api/trips/${params.id}/notes/${editingNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar nota');
      }

      setEditingNote(null);
      await fetchData();
      
      toast({
        title: 'Éxito',
        description: 'Nota actualizada exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar nota',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/trips/${params.id}/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar nota');
      }

      await fetchData();
      
      toast({
        title: 'Éxito',
        description: 'Nota eliminada exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar nota',
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
            <h1 className="text-3xl font-bold text-gray-900">Notas de viaje</h1>
            <p className="text-gray-600 mt-1">{trip.name} - {trip.destination}</p>
          </div>

          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva nota
          </Button>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Total Notas</p>
                    <p className="text-2xl font-bold text-gray-500">{statistics.total}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Esta Semana</p>
                    <p className="text-2xl font-bold text-green-500">{statistics.recent}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Importantes</p>
                    <p className="text-2xl font-bold text-red-500">
                      {statistics.byType.find(t => t.type === 'IMPORTANT')?.count || 0}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Recordatorios</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {statistics.byType.find(t => t.type === 'REMINDER')?.count || 0}
                    </p>
                  </div>
                  <Bell className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar en notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {noteTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Type distribution */}
        {statistics && statistics.byType.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Distribución por tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {statistics.byType.map((stat) => {
                  const typeData = getTypeData(stat.type);
                  const Icon = typeData.icon;
                  return (
                    <Badge key={stat.type} className={`${typeData.color} flex items-center gap-1`}>
                      <Icon className="h-3 w-3" />
                      {typeData.label}: {stat.count}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">
                No hay notas aún
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza escribiendo tus primeras notas de viaje
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear primera nota
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={setEditingNote}
                onDelete={handleDeleteNote}
                compact={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Note Dialog */}
      <Dialog open={showCreateForm || !!editingNote} onOpenChange={(open) => {
        if (!open) {
          setShowCreateForm(false);
          setEditingNote(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? 'Editar nota' : 'Nueva nota'}
            </DialogTitle>
          </DialogHeader>
          <NoteForm
            initialData={editingNote || undefined}
            onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingNote(null);
            }}
            isLoading={formLoading}
            mode={editingNote ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}