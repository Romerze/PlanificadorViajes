'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText,
  AlertTriangle,
  Lightbulb,
  Bell,
  Edit,
  Trash2,
  Calendar,
  MoreHorizontal,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  title?: string;
  content: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
  isLoading?: boolean;
  compact?: boolean;
}

const noteTypes = [
  { 
    value: 'GENERAL', 
    label: 'General', 
    icon: FileText, 
    color: 'bg-gray-100 text-gray-700 border-gray-200'
  },
  { 
    value: 'IMPORTANT', 
    label: 'Importante', 
    icon: AlertTriangle, 
    color: 'bg-red-100 text-red-700 border-red-200'
  },
  { 
    value: 'REMINDER', 
    label: 'Recordatorio', 
    icon: Bell, 
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  { 
    value: 'IDEA', 
    label: 'Idea', 
    icon: Lightbulb, 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
];

export function NoteCard({ 
  note, 
  onEdit, 
  onDelete,
  isLoading = false,
  compact = false
}: NoteCardProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeData = (type: string) => {
    return noteTypes.find(t => t.value === type) || noteTypes[0];
  };

  const typeData = getTypeData(note.type);
  const TypeIcon = typeData.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Hace 1 día';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
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

  const copyToClipboard = async () => {
    try {
      const text = `${note.title ? note.title + '\n\n' : ''}${note.content}`;
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copiado',
        description: 'Nota copiada al portapapeles',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo copiar la nota',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      onDelete(note.id);
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const shouldShowExpand = note.content.length > 150;
  const displayContent = (compact && !isExpanded) ? truncateContent(note.content) : note.content;

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${typeData.color} border-l-4`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {note.title && (
              <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                {note.title}
              </h3>
            )}
            
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${typeData.color} border`}>
                <TypeIcon className="h-3 w-3 mr-1" />
                {typeData.label}
              </Badge>
              <span className="text-xs text-gray-500">
                {formatDate(note.updatedAt)}
              </span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={isLoading}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(note)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Content */}
        <div className="space-y-3">
          <div className="prose prose-sm max-w-none">
            {displayContent.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-2 text-gray-700">
                {paragraph || '\u00A0'}
              </p>
            ))}
          </div>

          {/* Expand/Collapse */}
          {shouldShowExpand && compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-700 p-0 h-auto"
            >
              {isExpanded ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Ver menos
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Ver más
                </>
              )}
            </Button>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span title={`Creado: ${formatDateTime(note.createdAt)}`}>
                <Calendar className="h-3 w-3 inline mr-1" />
                Creado {formatDate(note.createdAt)}
              </span>
              {note.updatedAt !== note.createdAt && (
                <span title={`Actualizado: ${formatDateTime(note.updatedAt)}`}>
                  Editado {formatDate(note.updatedAt)}
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(note)}
                  disabled={isLoading}
                  className="h-7 w-7 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-7 w-7 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}