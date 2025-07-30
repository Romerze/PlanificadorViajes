'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Plane,
  Building,
  Utensils,
  MapPin,
  ShoppingBag,
  Shield,
  MoreHorizontal,
  ExternalLink
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
import { BudgetForm } from '@/components/budget/budget-form';
import { ExpenseForm } from '@/components/budget/expense-form';

interface Trip {
  id: string;
  name: string;
  destination: string;
}

interface Budget {
  id: string;
  category: string;
  plannedAmount: number | string;
  actualAmount: number | string;
  currency: string;
  notes?: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number | string;
  currency: string;
  date: string;
  category: string;
  location?: string;
  receiptUrl?: string;
  notes?: string;
  budget?: {
    id: string;
    category: string;
  };
}

interface BudgetSummary {
  totalPlanned: number | string;
  totalActual: number | string;
  remaining: number | string;
  percentageUsed: number;
}

interface ExpenseSummary {
  totalSpent: number | string;
  totalExpenses: number;
  categoryTotals: Array<{
    category: string;
    total: number | string;
    count: number;
  }>;
}

const budgetCategories = [
  { value: 'TRANSPORT', label: 'Transporte', icon: Plane, color: 'bg-blue-100 text-blue-700' },
  { value: 'ACCOMMODATION', label: 'Hospedaje', icon: Building, color: 'bg-green-100 text-green-700' },
  { value: 'FOOD', label: 'Comida', icon: Utensils, color: 'bg-orange-100 text-orange-700' },
  { value: 'ACTIVITIES', label: 'Actividades', icon: MapPin, color: 'bg-purple-100 text-purple-700' },
  { value: 'SHOPPING', label: 'Compras', icon: ShoppingBag, color: 'bg-pink-100 text-pink-700' },
  { value: 'EMERGENCY', label: 'Emergencia', icon: Shield, color: 'bg-red-100 text-red-700' },
  { value: 'OTHER', label: 'Otros', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700' },
];

export default function BudgetPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [budget, setBudget] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [showCreateExpense, setShowCreateExpense] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
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

      // Fetch budget
      const budgetResponse = await fetch(`/api/trips/${params.id}/budget`);
      if (!budgetResponse.ok) {
        throw new Error('Error al cargar presupuesto');
      }
      const budgetData = await budgetResponse.json();
      setBudget(budgetData.budget || []);
      setBudgetSummary(budgetData.summary);

      // Fetch expenses
      const expenseParams = new URLSearchParams();
      if (searchTerm) expenseParams.append('search', searchTerm);
      if (categoryFilter && categoryFilter !== 'all') expenseParams.append('category', categoryFilter);
      
      const expenseResponse = await fetch(`/api/trips/${params.id}/expenses?${expenseParams.toString()}`);
      if (!expenseResponse.ok) {
        throw new Error('Error al cargar gastos');
      }
      const expenseData = await expenseResponse.json();
      setExpenses(expenseData.expenses || []);
      setExpenseSummary(expenseData.summary);
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
  }, [params.id, session, toast, searchTerm, categoryFilter]);

  // Authentication checks
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/auth/signin');
    return null;
  }

  // Helper functions
  const getCategoryData = (category: string) => {
    return budgetCategories.find(cat => cat.value === category) || budgetCategories[0];
  };

  const formatPrice = (price: number | string, currency: string) => {
    const numPrice = typeof price === 'number' ? price : parseFloat(price.toString());
    return `${currency} ${numPrice.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // CRUD operations
  const handleUpdateBudget = async (data: any) => {
    if (!editingBudget) return;
    
    setFormLoading(true);
    try {
      const response = await fetch(`/api/trips/${params.id}/budget/${editingBudget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar presupuesto');
      }

      const updatedBudget = await response.json();
      setEditingBudget(null);
      
      // Refresh all data to get updated calculations
      await fetchData();
      
      toast({
        title: 'Éxito',
        description: 'Presupuesto actualizado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar presupuesto',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateExpense = async (data: any) => {
    if (!editingExpense) return;
    
    setFormLoading(true);
    try {
      const response = await fetch(`/api/trips/${params.id}/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar gasto');
      }

      const updatedExpense = await response.json();
      setEditingExpense(null);
      
      // Refresh all data to get updated budget calculations
      await fetchData();
      
      toast({
        title: 'Éxito',
        description: 'Gasto actualizado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar gasto',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) return;
    
    try {
      const response = await fetch(`/api/trips/${params.id}/budget/${budgetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar presupuesto');
      }

      // Refresh all data to get updated calculations
      await fetchData();
      
      toast({
        title: 'Éxito',
        description: 'Presupuesto eliminado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar presupuesto',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este gasto?')) return;
    
    try {
      const response = await fetch(`/api/trips/${params.id}/expenses/${expenseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar gasto');
      }

      // Refresh all data to get updated budget calculations
      await fetchData();
      
      toast({
        title: 'Éxito',
        description: 'Gasto eliminado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar gasto',
        variant: 'destructive',
      });
    }
  };

  const handleCreateBudget = async (data: any) => {
    setFormLoading(true);
    try {
      const response = await fetch(`/api/trips/${params.id}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear presupuesto');
      }

      const newBudget = await response.json();
      setShowCreateBudget(false);
      
      // Refresh all data to get updated calculations
      await fetchData();
      
      toast({
        title: 'Éxito',
        description: 'Presupuesto creado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear presupuesto',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateExpense = async (data: any) => {
    setFormLoading(true);
    try {
      const response = await fetch(`/api/trips/${params.id}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al agregar gasto');
      }

      const newExpense = await response.json();
      setShowCreateExpense(false);
      
      // Refresh all data to get updated budget calculations
      await fetchData();
      
      toast({
        title: 'Éxito',
        description: 'Gasto agregado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al agregar gasto',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
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
            <h1 className="text-3xl font-bold text-gray-900">Presupuesto</h1>
            <p className="text-gray-600 mt-1">{trip.name} - {trip.destination}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowCreateBudget(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Presupuesto
            </Button>
            <Button
              onClick={() => setShowCreateExpense(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Gasto
            </Button>
          </div>
        </div>

        {/* Budget Summary */}
        {budgetSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Presupuesto Total</p>
                    <p className="text-2xl font-bold text-gray-500">
                      {formatPrice(budgetSummary.totalPlanned, 'PEN')}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Gastado</p>
                    <p className="text-2xl font-bold text-gray-500">
                      {formatPrice(budgetSummary.totalActual, 'PEN')}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Restante</p>
                    <p className={`text-2xl font-bold ${Number(budgetSummary.remaining) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPrice(budgetSummary.remaining, 'PEN')}
                    </p>
                  </div>
                  {Number(budgetSummary.remaining) >= 0 ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">% Usado</p>
                    <p className="text-2xl font-bold text-gray-500">
                      {budgetSummary.percentageUsed.toFixed(1)}%
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-purple-600" />
                </div>
                <Progress 
                  value={Math.min(budgetSummary.percentageUsed, 100)} 
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Budget Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Budget Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Presupuesto por Categoría</CardTitle>
              <CardDescription>
                {budget.length > 0 
                  ? `${budget.length} categorías configuradas`
                  : 'No hay categorías de presupuesto configuradas'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {budget.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No hay presupuestos aún</p>
                  <Button size="sm" className="mt-3" onClick={() => setShowCreateBudget(true)}>
                    Crear primer presupuesto
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {budget.map((item) => {
                    const categoryData = getCategoryData(item.category);
                    const Icon = categoryData.icon;
                    const plannedAmt = typeof item.plannedAmount === 'number' ? item.plannedAmount : parseFloat(item.plannedAmount.toString());
                    const actualAmt = typeof item.actualAmount === 'number' ? item.actualAmount : parseFloat(item.actualAmount.toString());
                    const percentageUsed = plannedAmt > 0 
                      ? (actualAmt / plannedAmt) * 100 
                      : 0;
                    
                    return (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${categoryData.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{categoryData.label}</p>
                              <p className="text-sm text-gray-600">
                                {formatPrice(item.actualAmount, item.currency)} / {formatPrice(item.plannedAmount, item.currency)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingBudget(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteBudget(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Progress 
                          value={Math.min(percentageUsed, 100)} 
                          className="mb-2"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{percentageUsed.toFixed(1)}% usado</span>
                          <span className={percentageUsed > 100 ? 'text-red-600' : 'text-green-600'}>
                            {formatPrice(plannedAmt - actualAmt, item.currency)} restante
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos Recientes</CardTitle>
              <CardDescription>
                {expenseSummary 
                  ? `${expenseSummary.totalExpenses} gastos registrados`
                  : 'No hay gastos registrados'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No hay gastos aún</p>
                  <Button size="sm" className="mt-3" onClick={() => setShowCreateExpense(true)}>
                    Agregar primer gasto
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Receipt className="h-4 w-4 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">{expense.description}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{expense.category}</span>
                            <span>•</span>
                            <span>{formatDate(expense.date)}</span>
                            {expense.location && (
                              <>
                                <span>•</span>
                                <span>{expense.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatPrice(expense.amount, expense.currency)}
                          </p>
                          {expense.receiptUrl && (
                            <a 
                              href={expense.receiptUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingExpense(expense)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Budget Dialog */}
      <Dialog open={showCreateBudget || !!editingBudget} onOpenChange={(open) => {
        if (!open) {
          setShowCreateBudget(false);
          setEditingBudget(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
            </DialogTitle>
          </DialogHeader>
          <BudgetForm
            initialData={editingBudget ? {
              ...editingBudget,
              plannedAmount: Number(editingBudget.plannedAmount),
              actualAmount: Number(editingBudget.actualAmount)
            } : undefined}
            onSubmit={editingBudget ? handleUpdateBudget : handleCreateBudget}
            onCancel={() => {
              setShowCreateBudget(false);
              setEditingBudget(null);
            }}
            isLoading={formLoading}
            mode={editingBudget ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>

      {/* Create/Edit Expense Dialog */}
      <Dialog open={showCreateExpense || !!editingExpense} onOpenChange={(open) => {
        if (!open) {
          setShowCreateExpense(false);
          setEditingExpense(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
            </DialogTitle>
          </DialogHeader>
          <ExpenseForm
            initialData={editingExpense ? {
              ...editingExpense,
              amount: Number(editingExpense.amount)
            } : undefined}
            budgets={budget}
            onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
            onCancel={() => {
              setShowCreateExpense(false);
              setEditingExpense(null);
            }}
            isLoading={formLoading}
            mode={editingExpense ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}