'use client';

import React from 'react';
import { Plus, MapPin, Calendar, Plane, FileText, Camera, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

interface QuickActionsProps {
  onNewTrip: () => void;
  onAddTransport: () => void;
  onAddActivity: () => void;
  onViewItinerary: () => void;
  onAddDocument: () => void;
  onViewGallery: () => void;
  onSettings: () => void;
}

export function QuickActions({
  onNewTrip,
  onAddTransport,
  onAddActivity,
  onViewItinerary,
  onAddDocument,
  onViewGallery,
  onSettings,
}: QuickActionsProps) {
  const quickActions: QuickAction[] = [
    {
      id: 'new-trip',
      title: 'Nuevo Viaje',
      description: 'Planifica tu próxima aventura',
      icon: <Plus className="h-5 w-5" strokeWidth={1.5} />,
      action: onNewTrip,
      variant: 'primary',
    },
    {
      id: 'add-transport',
      title: 'Agregar Transporte',
      description: 'Vuelos, buses, trenes',
      icon: <Plane className="h-5 w-5" strokeWidth={1.5} />,
      action: onAddTransport,
    },
    {
      id: 'add-activity',
      title: 'Nueva Actividad',
      description: 'Lugares y experiencias',
      icon: <MapPin className="h-5 w-5" strokeWidth={1.5} />,
      action: onAddActivity,
    },
    {
      id: 'view-itinerary',
      title: 'Ver Itinerario',
      description: 'Planificación día a día',
      icon: <Calendar className="h-5 w-5" strokeWidth={1.5} />,
      action: onViewItinerary,
    },
    {
      id: 'add-document',
      title: 'Subir Documento',
      description: 'Pasaportes, reservas, tickets',
      icon: <FileText className="h-5 w-5" strokeWidth={1.5} />,
      action: onAddDocument,
    },
    {
      id: 'view-gallery',
      title: 'Galería',
      description: 'Fotos y recuerdos',
      icon: <Camera className="h-5 w-5" strokeWidth={1.5} />,
      action: onViewGallery,
    },
  ];

  return (
    <Card className="p-6 bg-white border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
          <p className="text-sm text-gray-500">Accesos directos a funciones principales</p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettings}
          className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {quickActions.map((action) => (
          <Button
            key={action.id}
            className={
              action.variant === 'primary' 
                ? 'group h-auto p-4 flex items-center gap-4 text-left justify-start bg-blue-600 hover:bg-blue-700 text-white border-blue-600 transition-colors duration-200' 
                : 'group h-auto p-4 flex items-center gap-4 text-left justify-start bg-black text-white hover:bg-white hover:text-black border border-black transition-colors duration-200'
            }
            onClick={action.action}
          >
            <div className={
              action.variant === 'primary' 
                ? 'p-3 rounded-lg flex-shrink-0 bg-white bg-opacity-20 text-white' 
                : 'p-3 rounded-lg flex-shrink-0 bg-white bg-opacity-20 text-white group-hover:bg-black group-hover:bg-opacity-20 group-hover:text-black'
            }>
              {action.icon}
            </div>
            
            <div className="min-w-0 flex-1">
              <h4 className={
                action.variant === 'primary' 
                  ? 'font-semibold text-sm mb-1 text-white' 
                  : 'font-semibold text-sm mb-1 text-white group-hover:text-black'
              }>
                {action.title}
              </h4>
              <p className={
                action.variant === 'primary' 
                  ? 'text-xs text-white' 
                  : 'text-xs text-white group-hover:text-black'
              }>
                {action.description}
              </p>
            </div>
          </Button>
        ))}
      </div>

      {/* Pro Tip */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-100 rounded">
            <Settings className="h-3 w-3 text-blue-600" strokeWidth={2} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              💡 Consejo Pro
            </h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              Utiliza las teclas rápidas: <kbd className="px-1.5 py-0.5 bg-white rounded text-xs border border-blue-300">Ctrl+N</kbd> para nuevo viaje, 
              <kbd className="px-1.5 py-0.5 bg-white rounded text-xs border border-blue-300 ml-1">Ctrl+T</kbd> para transporte.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}