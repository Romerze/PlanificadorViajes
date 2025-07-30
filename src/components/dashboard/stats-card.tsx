'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus, MapPin, Euro, Globe, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    type: 'up' | 'down' | 'neutral';
    value: string;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'error';
  loading?: boolean;
}

const variantConfig = {
  default: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    trendColor: 'text-blue-600',
  },
  success: {
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    trendColor: 'text-green-600',
  },
  warning: {
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    trendColor: 'text-orange-600',
  },
  error: {
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    trendColor: 'text-red-600',
  },
} as const;

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
} as const;

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  loading = false,
}: StatsCardProps) {
  const config = variantConfig[variant];
  const TrendIcon = trend ? trendIcons[trend.type] : null;

  if (loading) {
    return (
      <Card className="p-6 bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            {/* Title skeleton */}
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            {/* Value skeleton */}
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2" />
            {/* Subtitle skeleton */}
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
          {/* Icon skeleton */}
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="space-y-1 flex-1">
          {/* Title */}
          <p className="text-sm font-medium text-gray-600">
            {title}
          </p>
          
          {/* Value */}
          <p className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString('es-ES') : value}
          </p>
          
          {/* Subtitle and Trend */}
          <div className="flex items-center gap-2 text-sm">
            {subtitle && (
              <span className="text-gray-500">{subtitle}</span>
            )}
            
            {trend && TrendIcon && (
              <div className={`flex items-center gap-1 ${config.trendColor}`}>
                <TrendIcon className="h-3 w-3" strokeWidth={2} />
                <span className="font-medium">{trend.value}</span>
                <span className="text-gray-500">{trend.label}</span>
              </div>
            )}
          </div>
        </div>

        {/* Icon */}
        <div className={`p-3 rounded-lg ${config.iconBg}`}>
          <Icon className={`h-6 w-6 ${config.iconColor}`} strokeWidth={1.5} />
        </div>
      </div>
    </Card>
  );
}

// Preset components for common use cases
export function TripStatsCard({ 
  totalTrips, 
  loading = false 
}: { 
  totalTrips: number; 
  loading?: boolean; 
}) {
  return (
    <StatsCard
      title="Viajes Totales"
      value={totalTrips}
      subtitle="Aventuras planificadas"
      icon={MapPin}
      variant="default"
      loading={loading}
      trend={totalTrips > 0 ? {
        type: 'up',
        value: '+2',
        label: 'este mes'
      } : undefined}
    />
  );
}

export function BudgetStatsCard({ 
  totalBudget, 
  currency = 'PEN',
  loading = false 
}: { 
  totalBudget: number; 
  currency?: string;
  loading?: boolean; 
}) {
  const formatCurrency = (amount: number, curr: string) => {
    if (curr === 'PEN') {
      return `S/ ${amount.toLocaleString('es-PE')}`;
    }
    return `${amount.toLocaleString('es-PE')} ${curr}`;
  };

  return (
    <StatsCard
      title="Presupuesto Total"
      value={formatCurrency(totalBudget, currency)}
      subtitle="Inversión en experiencias"
      icon={Euro}
      variant="success"
      loading={loading}
      trend={{
        type: 'down',
        value: '12%',
        label: 'vs mes anterior'
      }}
    />
  );
}

export function CountriesStatsCard({ 
  countriesVisited, 
  loading = false 
}: { 
  countriesVisited: number; 
  loading?: boolean; 
}) {
  return (
    <StatsCard
      title="Países Visitados"
      value={countriesVisited}
      subtitle="Culturas descubiertas"
      icon={Globe}
      variant="warning"
      loading={loading}
      trend={{
        type: 'up',
        value: '+3',
        label: 'este año'
      }}
    />
  );
}

export function DaysStatsCard({ 
  totalDays, 
  loading = false 
}: { 
  totalDays: number; 
  loading?: boolean; 
}) {
  return (
    <StatsCard
      title="Días de Aventura"
      value={totalDays}
      subtitle="Momentos inolvidables"
      icon={Calendar}
      variant="error"
      loading={loading}
      trend={{
        type: 'up',
        value: '+45',
        label: 'este año'
      }}
    />
  );
}