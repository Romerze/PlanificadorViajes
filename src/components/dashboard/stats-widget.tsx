'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  LucideIcon
} from 'lucide-react';

interface StatsWidgetProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  progress?: {
    value: number;
    max: number;
    label?: string;
  };
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gray';
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600', 
  red: 'text-red-600',
  orange: 'text-orange-600',
  purple: 'text-purple-600',
  gray: 'text-gray-600',
};

const sizeClasses = {
  sm: {
    icon: 'h-5 w-5',
    title: 'text-sm',
    value: 'text-lg',
  },
  md: {
    icon: 'h-6 w-6',
    title: 'text-sm',
    value: 'text-2xl',
  },
  lg: {
    icon: 'h-8 w-8',
    title: 'text-base',
    value: 'text-3xl',
  },
};

export function StatsWidget({
  title,
  value,
  description,
  icon: Icon,
  trend,
  progress,
  color = 'blue',
  badge,
  size = 'md'
}: StatsWidgetProps) {
  const colorClass = colorClasses[color];
  const sizeClass = sizeClasses[size];

  const getTrendIcon = () => {
    switch (trend?.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend?.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className={`${sizeClass.title} font-medium text-gray-400`}>
                {title}
              </p>
              {badge && (
                <Badge variant={badge.variant || 'secondary'} className="text-xs">
                  {badge.text}
                </Badge>
              )}
            </div>
            
            <p className={`${sizeClass.value} font-bold text-gray-500`}>
              {typeof value === 'number' && value > 999 
                ? `${(value / 1000).toFixed(1)}k` 
                : value}
            </p>
            
            {description && (
              <p className="text-xs text-gray-500 mt-1">
                {description}
              </p>
            )}

            {trend && (
              <div className={`flex items-center gap-1 mt-2 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-xs font-medium">
                  {trend.value > 0 ? '+' : ''}{trend.value}
                </span>
                <span className="text-xs text-gray-500">
                  {trend.label}
                </span>
              </div>
            )}

            {progress && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">
                    {progress.label || 'Progreso'}
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    {progress.value}/{progress.max}
                  </span>
                </div>
                <Progress 
                  value={(progress.value / progress.max) * 100} 
                  className="h-2"
                />
              </div>
            )}
          </div>
          
          <div className={`ml-4 ${colorClass}`}>
            <Icon className={sizeClass.icon} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}