'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  PiggyBank,
  CreditCard,
  Wallet
} from 'lucide-react';

interface FinancialData {
  budget: {
    planned: number;
    actual: number;
    remaining: number;
  };
  expenses: {
    total: number;
    count: number;
    byCategory: Array<{
      category: string;
      amount: number;
      count: number;
    }>;
  };
  transportation: {
    totalCost: number;
  };
  accommodation: {
    totalCost: number;
  };
}

interface FinancialSummaryProps {
  data: FinancialData;
  currency?: string;
}

export function FinancialSummary({ data, currency = 'PEN' }: FinancialSummaryProps) {
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const budgetUsagePercentage = data.budget.planned > 0 
    ? (data.budget.actual / data.budget.planned) * 100 
    : 0;

  const isOverBudget = budgetUsagePercentage > 100;
  const isNearBudgetLimit = budgetUsagePercentage > 80 && budgetUsagePercentage <= 100;

  const totalPlannedCosts = data.transportation.totalCost + data.accommodation.totalCost;
  const estimatedTotal = totalPlannedCosts + data.expenses.total;

  const topExpenseCategories = data.expenses.byCategory
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const getBudgetStatus = () => {
    if (isOverBudget) {
      return {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        status: 'Sobre presupuesto',
        message: `Estás ${formatMoney(data.budget.actual - data.budget.planned)} por encima del presupuesto.`
      };
    } else if (isNearBudgetLimit) {
      return {
        icon: AlertTriangle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        status: 'Cerca del límite',
        message: `Te quedan ${formatMoney(data.budget.remaining)} del presupuesto.`
      };
    } else {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        status: 'Dentro del presupuesto',
        message: `Tienes ${formatMoney(data.budget.remaining)} disponibles.`
      };
    }
  };

  const budgetStatus = getBudgetStatus();
  const StatusIcon = budgetStatus.icon;

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-green-600" />
            Resumen Financiero
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Budget Status Alert */}
          <div className={`p-4 rounded-lg ${budgetStatus.bgColor} ${budgetStatus.borderColor} border mb-6`}>
            <div className="flex items-start gap-3">
              <StatusIcon className={`h-5 w-5 ${budgetStatus.color} mt-0.5`} />
              <div>
                <h4 className={`font-medium ${budgetStatus.color} mb-1`}>
                  {budgetStatus.status}
                </h4>
                <p className={`text-sm ${budgetStatus.color}`}>
                  {budgetStatus.message}
                </p>
              </div>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Uso del presupuesto</span>
                <span className="text-sm text-gray-500">
                  {budgetUsagePercentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.min(budgetUsagePercentage, 100)} 
                className="h-3"
              />
              {isOverBudget && (
                <div className="mt-1">
                  <div className="text-xs text-red-600 text-right">
                    +{formatMoney(data.budget.actual - data.budget.planned)} sobre presupuesto
                  </div>
                </div>
              )}
            </div>

            {/* Budget Details */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {formatMoney(data.budget.planned)}
                </p>
                <p className="text-xs text-gray-600">Planificado</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-500'}`}>
                  {formatMoney(data.budget.actual)}
                </p>
                <p className="text-xs text-gray-600">Gastado</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${data.budget.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatMoney(Math.abs(data.budget.remaining))}
                </p>
                <p className="text-xs text-gray-600">
                  {data.budget.remaining < 0 ? 'Excedido' : 'Disponible'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              Gastos Rápidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Total gastado</span>
                </div>
                <span className="font-semibold">{formatMoney(data.expenses.total)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Número de gastos</span>
                </div>
                <Badge variant="outline">{data.expenses.count}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Promedio por gasto</span>
                </div>
                <span className="font-semibold">
                  {data.expenses.count > 0 
                    ? formatMoney(data.expenses.total / data.expenses.count)
                    : formatMoney(0)
                  }
                </span>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Estimado total</span>
                  <span className="font-bold text-lg">{formatMoney(estimatedTotal)}</span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">• Transporte:</span>
                    <span className="text-gray-500">{formatMoney(data.transportation.totalCost)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">• Hospedaje:</span>
                    <span className="text-gray-500">{formatMoney(data.accommodation.totalCost)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">• Gastos registrados:</span>
                    <span className="text-gray-500">{formatMoney(data.expenses.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-purple-600" />
              Top Categorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topExpenseCategories.length > 0 ? (
              <div className="space-y-3">
                {topExpenseCategories.map((category, index) => {
                  const percentage = data.expenses.total > 0 
                    ? (category.amount / data.expenses.total) * 100 
                    : 0;
                  
                  return (
                    <div key={category.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-500">
                          {category.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {category.count}
                          </Badge>
                          <span className="text-sm font-semibold">
                            {formatMoney(category.amount)}
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {percentage.toFixed(1)}% del total
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No hay gastos registrados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}