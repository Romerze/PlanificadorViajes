'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plane,
  MapPin,
  DollarSign,
  Building,
  FileText,
  Calendar,
  Camera,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Circle,
  ArrowRight
} from 'lucide-react';

interface ModuleData {
  name: string;
  completion: number;
  count: number;
  target: number;
}

interface ModuleProgressProps {
  modules: ModuleData[];
  onNavigate?: (moduleName: string) => void;
}

const moduleConfig = {
  transportation: {
    label: 'Transporte',
    icon: Plane,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    route: 'transportation'
  },
  activities: {
    label: 'Actividades',
    icon: MapPin,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    route: 'activities'
  },
  budget: {
    label: 'Presupuesto',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    route: 'budget'
  },
  accommodation: {
    label: 'Hospedaje',
    icon: Building,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    route: 'accommodation'
  },
  documents: {
    label: 'Documentos',
    icon: FileText,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    route: 'documents'
  },
  itinerary: {
    label: 'Itinerario',
    icon: Calendar,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    route: 'itinerary'
  },
  photos: {
    label: 'Fotos',
    icon: Camera,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    route: 'photos'
  },
  notes: {
    label: 'Notas',
    icon: BookOpen,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    route: 'notes'
  },
};

export function ModuleProgress({ modules, onNavigate }: ModuleProgressProps) {
  const getStatusIcon = (completion: number) => {
    if (completion >= 100) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (completion >= 50) {
      return <AlertCircle className="h-4 w-4 text-orange-600" />;
    } else {
      return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (completion: number) => {
    if (completion >= 100) {
      return <Badge className="bg-green-100 text-green-700 hover:text-white hover:bg-green-600">Completo</Badge>;
    } else if (completion >= 75) {
      return <Badge className="bg-blue-100 text-blue-700 hover:text-white hover:bg-blue-600">Casi listo</Badge>;
    } else if (completion >= 25) {
      return <Badge className="bg-orange-100 text-orange-700 hover:text-white hover:bg-orange-600">En progreso</Badge>;
    } else {
      return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  const overallCompletion = Math.round(
    modules.reduce((acc, module) => acc + module.completion, 0) / modules.length
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Progreso del Planning
          </CardTitle>
          <Badge 
            className={`text-lg px-3 py-1 ${
              overallCompletion >= 80 
                ? 'bg-green-100 text-green-700 hover:text-white' 
                : overallCompletion >= 50
                ? 'bg-blue-100 text-blue-700 hover:text-white'
                : 'bg-orange-100 text-orange-700 hover:text-white'
            }`}
          >
            {overallCompletion}%
          </Badge>
        </div>
        <div className="mt-2">
          <Progress value={overallCompletion} className="h-3" />
          <p className="text-sm text-gray-600 mt-1">
            {modules.filter(m => m.completion >= 100).length} de {modules.length} módulos completados
          </p>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {modules.map((module) => {
            const config = moduleConfig[module.name as keyof typeof moduleConfig];
            if (!config) return null;

            const Icon = config.icon;
            
            return (
              <div 
                key={module.name}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {config.label}
                      </span>
                      {getStatusIcon(module.completion)}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Progress value={module.completion} className="h-2 flex-1" />
                      <span className="text-xs text-gray-500 min-w-12">
                        {module.count}/{module.target}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {getStatusBadge(module.completion)}
                  {onNavigate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate(config.route)}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {overallCompletion < 100 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  ¡Continúa planificando tu viaje!
                </h4>
                <p className="text-sm text-blue-700">
                  {overallCompletion >= 75 
                    ? 'Ya casi terminas. Completa los últimos detalles para estar 100% listo.'
                    : overallCompletion >= 50
                    ? 'Vas por buen camino. Sigue agregando información para completar tu plan.'
                    : 'Recién empiezas. ¡Agrega más detalles a cada módulo para un mejor planning!'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {overallCompletion >= 100 && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">
                  ¡Felicitaciones! 🎉
                </h4>
                <p className="text-sm text-green-700">
                  Tu viaje está completamente planificado. ¡Ya estás listo para disfrutar tu aventura!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}