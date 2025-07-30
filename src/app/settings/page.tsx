'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Navbar } from '@/components/layout/navbar';
import { 
  Settings as SettingsIcon,
  Globe,
  Bell,
  Shield,
  Palette,
  Moon,
  Sun,
  Monitor,
  Trash2,
  LogOut,
  Save,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [settings, setSettings] = useState({
    language: 'es',
    theme: 'light',
    notifications: {
      email: true,
      push: false,
      tripReminders: true,
      weatherAlerts: true
    },
    privacy: {
      profileVisibility: 'private',
      shareTrips: false,
      dataCollection: true
    },
    preferences: {
      currency: 'USD',
      dateFormat: 'DD/MM/YYYY',
      temperatureUnit: 'celsius'
    }
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect('/auth/signin');
    return null;
  }

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Aquí implementarías la llamada a la API para guardar la configuración
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulando API call
      
      toast({
        title: 'Configuración guardada',
        description: 'Los cambios se han aplicado correctamente.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      // Aquí implementarías la llamada a la API para eliminar la cuenta
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulando API call
      
      toast({
        title: 'Cuenta eliminada',
        description: 'Tu cuenta ha sido eliminada permanentemente.',
      });
      
      signOut({ callbackUrl: '/' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la cuenta. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const updateSettings = (category: string, key: string, value: any) => {
    if (category === '') {
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...(prev[category as keyof typeof prev] as any),
          [key]: value
        }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-light text-gray-900">Configuración</h1>
              <p className="text-base sm:text-lg text-gray-500">
                Personaliza tu experiencia en la plataforma
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button 
                variant="outline"
                onClick={handleSignOut}
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </Button>
              <Button 
                onClick={handleSaveSettings}
                disabled={loading}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* General Settings */}
          <Card className="border-gray-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <SettingsIcon className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg sm:text-xl font-medium text-gray-900">General</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <Select value={settings.language} onValueChange={(value) => updateSettings('', 'language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select value={settings.theme} onValueChange={(value) => updateSettings('', 'theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Claro
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Oscuro
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          Sistema
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="border-gray-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Palette className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg sm:text-xl font-medium text-gray-900">Preferencias</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select value={settings.preferences.currency} onValueChange={(value) => updateSettings('preferences', 'currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="PEN">PEN (S/)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Formato de fecha</Label>
                  <Select value={settings.preferences.dateFormat} onValueChange={(value) => updateSettings('preferences', 'dateFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Temperatura</Label>
                  <Select value={settings.preferences.temperatureUnit} onValueChange={(value) => updateSettings('preferences', 'temperatureUnit', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celsius">Celsius (°C)</SelectItem>
                      <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-gray-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Bell className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg sm:text-xl font-medium text-gray-900">Notificaciones</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Notificaciones por email</Label>
                    <p className="text-sm text-gray-500">Recibir actualizaciones importantes por correo</p>
                  </div>
                  <Button
                    variant={settings.notifications.email ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSettings('notifications', 'email', !settings.notifications.email)}
                    className={settings.notifications.email ? "bg-gray-900 text-white" : "border-gray-200 text-gray-600"}
                  >
                    {settings.notifications.email ? 'Activado' : 'Desactivado'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Recordatorios de viajes</Label>
                    <p className="text-sm text-gray-500">Alertas antes de fechas importantes</p>
                  </div>
                  <Button
                    variant={settings.notifications.tripReminders ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSettings('notifications', 'tripReminders', !settings.notifications.tripReminders)}
                    className={settings.notifications.tripReminders ? "bg-gray-900 text-white" : "border-gray-200 text-gray-600"}
                  >
                    {settings.notifications.tripReminders ? 'Activado' : 'Desactivado'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Alertas del clima</Label>
                    <p className="text-sm text-gray-500">Notificaciones sobre el clima en tus destinos</p>
                  </div>
                  <Button
                    variant={settings.notifications.weatherAlerts ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSettings('notifications', 'weatherAlerts', !settings.notifications.weatherAlerts)}
                    className={settings.notifications.weatherAlerts ? "bg-gray-900 text-white" : "border-gray-200 text-gray-600"}
                  >
                    {settings.notifications.weatherAlerts ? 'Activado' : 'Desactivado'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="border-gray-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Shield className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg sm:text-xl font-medium text-gray-900">Privacidad y Seguridad</h2>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Visibilidad del perfil</Label>
                  <Select value={settings.privacy.profileVisibility} onValueChange={(value) => updateSettings('privacy', 'profileVisibility', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Público</SelectItem>
                      <SelectItem value="private">Privado</SelectItem>
                      <SelectItem value="friends">Solo amigos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Compartir viajes públicamente</Label>
                    <p className="text-sm text-gray-500">Permitir que otros vean tus viajes completados</p>
                  </div>
                  <Button
                    variant={settings.privacy.shareTrips ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSettings('privacy', 'shareTrips', !settings.privacy.shareTrips)}
                    className={settings.privacy.shareTrips ? "bg-gray-900 text-white" : "border-gray-200 text-gray-600"}
                  >
                    {settings.privacy.shareTrips ? 'Activado' : 'Desactivado'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Recopilación de datos para mejorar la experiencia</Label>
                    <p className="text-sm text-gray-500">Ayúdanos a mejorar el producto con datos anónimos</p>
                  </div>
                  <Button
                    variant={settings.privacy.dataCollection ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSettings('privacy', 'dataCollection', !settings.privacy.dataCollection)}
                    className={settings.privacy.dataCollection ? "bg-gray-900 text-white" : "border-gray-200 text-gray-600"}
                  >
                    {settings.privacy.dataCollection ? 'Activado' : 'Desactivado'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h2 className="text-lg sm:text-xl font-medium text-red-900">Zona de peligro</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-red-900 mb-2">Eliminar cuenta</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Esta acción no se puede deshacer. Se eliminarán permanentemente todos tus datos, viajes y configuraciones.
                  </p>
                  
                  {showDeleteConfirm ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-red-900">
                        ¿Estás seguro de que quieres eliminar tu cuenta permanentemente?
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="border-gray-300 text-gray-700"
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleDeleteAccount}
                          className="bg-red-600 text-white hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sí, eliminar mi cuenta
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteAccount}
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar cuenta
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}