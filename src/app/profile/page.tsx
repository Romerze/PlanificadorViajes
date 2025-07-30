'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/layout/navbar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit3,
  Save,
  X,
  Camera
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    location: '',
    bio: '',
    dateJoined: new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect('/auth/signin');
    return null;
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      // Aquí implementarías la llamada a la API para actualizar el perfil
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulando API call
      
      toast({
        title: 'Perfil actualizado',
        description: 'Los cambios se han guardado correctamente.',
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: session?.user?.name || '',
      email: session?.user?.email || '',
      phone: '',
      location: '',
      bio: '',
      dateJoined: formData.dateJoined
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-light text-gray-900">Mi Perfil</h1>
              <p className="text-base sm:text-lg text-gray-500">
                Gestiona tu información personal y preferencias
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                    className="border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-gray-900 text-white hover:bg-gray-800"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Guardando...' : 'Guardar'}
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar perfil
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Profile Photo & Basic Info */}
          <div className="lg:col-span-1">
            <Card className="border-gray-100">
              <CardContent className="p-6 text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <h2 className="text-xl font-medium text-gray-900 mb-2">
                  {formData.name || 'Usuario'}
                </h2>
                <p className="text-gray-500 text-sm mb-4">
                  {formData.email}
                </p>
                
                <div className="space-y-3 text-sm text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Miembro desde {formData.dateJoined}</span>
                  </div>
                  
                  {formData.location && (
                    <div className="flex items-center justify-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{formData.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="border-gray-100">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-gray-400" />
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50 text-gray-500' : ''}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50 text-gray-500' : ''}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          disabled={!isEditing}
                          placeholder="Número de teléfono"
                          className={!isEditing ? 'bg-gray-50 text-gray-500' : ''}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Ubicación</Label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          disabled={!isEditing}
                          placeholder="Ciudad, País"
                          className={!isEditing ? 'bg-gray-50 text-gray-500' : ''}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Cuéntanos un poco sobre ti y tus pasiones de viaje..."
                      className={`min-h-24 ${!isEditing ? 'bg-gray-50 text-gray-500' : ''}`}
                    />
                  </div>

                  {!isEditing && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        Haz clic en "Editar perfil" para modificar tu información personal.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Account Stats */}
        <div className="mt-8 sm:mt-12">
          <h3 className="text-lg sm:text-xl font-light text-gray-900 mb-4 sm:mb-6">Estadísticas de la cuenta</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-light text-gray-900 mb-1">0</div>
              <div className="text-xs sm:text-sm text-gray-500">Viajes completados</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-light text-gray-900 mb-1">0</div>
              <div className="text-xs sm:text-sm text-gray-500">Países visitados</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-light text-gray-900 mb-1">0</div>
              <div className="text-xs sm:text-sm text-gray-500">Fotos subidas</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-light text-gray-900 mb-1">0</div>
              <div className="text-xs sm:text-sm text-gray-500">Días de viaje</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}