'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Menu, 
  X, 
  Plane, 
  Calendar, 
  Map, 
  CreditCard, 
  Camera, 
  FileText,
  User,
  Settings,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TripForm } from '@/components/trips/trip-form'
import { useToast } from '@/hooks/use-toast'

export function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  const planningItems = getPlanningItems(() => setShowCreateForm(true))

  // Create trip
  const handleCreateTrip = async (data: any) => {
    setFormLoading(true);
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear viaje');
      }

      const newTrip = await response.json();
      setShowCreateForm(false);
      
      toast({
        title: 'Éxito',
        description: 'Viaje creado exitosamente',
      });

      // Navigate to the new trip
      router.push(`/trips/${newTrip.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear viaje',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4 flex h-16 items-center max-w-7xl">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-105 transition-transform duration-200">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">TripPlanner</span>
            <span className="text-xs text-gray-500 hidden sm:block">Organiza tu aventura</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1 md:justify-center">
          {session && (
            <div className="flex items-center space-x-1">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-black data-[state=open]:bg-black-100 text-gray-700 font-medium">
                      Planificación
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-2 p-4 md:w-[450px] md:grid-cols-1">
                        {planningItems.map((item) => (
                          <li key={item.title}>
                            <NavigationMenuLink asChild>
                              {item.action ? (
                                <div
                                  onClick={item.action}
                                  className={cn(
                                    'block select-none space-y-2 rounded-lg p-4 leading-none no-underline outline-none transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-200 border border-transparent cursor-pointer group'
                                  )}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:scale-105 transition-transform">
                                      <item.icon className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="text-sm font-semibold text-gray-300 group-hover:text-blue-900">
                                      {item.title}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-500 group-hover:text-blue-700 ml-11">
                                    {item.description}
                                  </p>
                                </div>
                              ) : (
                                <Link
                                  href={item.href!}
                                  className={cn(
                                    'block select-none space-y-2 rounded-lg p-4 leading-none no-underline outline-none transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-200 border border-transparent group'
                                  )}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg group-hover:scale-105 transition-transform">
                                      <item.icon className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="text-sm font-semibold text-gray-300 group-hover:text-blue-900">
                                      {item.title}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-500 group-hover:text-blue-700 ml-11">
                                    {item.description}
                                  </p>
                                </Link>
                              )}
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                Dashboard
              </Link>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex flex-1 items-center justify-end space-x-3">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-auto rounded-full px-3 hover:bg-gray-100">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8 ring-2 ring-gray-200">
                      <AvatarImage 
                        src={session.user?.image || ''} 
                        alt={session.user?.name || ''} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                        {session.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {session.user?.name?.split(' ')[0] || 'Usuario'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Mi cuenta
                      </p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2 p-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={session.user?.image || ''} 
                          alt={session.user?.name || ''} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                          {session.user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-gray-400">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center p-3 hover:bg-gray-50">
                    <div className="p-2 bg-gray-100 rounded-lg mr-3">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="font-medium">Mi Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center p-3 hover:bg-gray-50">
                    <div className="p-2 bg-gray-100 rounded-lg mr-3">
                      <Settings className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="font-medium">Configuración</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center p-3 text-red-600 hover:bg-red-50"
                  onClick={() => signOut()}
                >
                  <div className="p-2 bg-red-100 rounded-lg mr-3">
                    <LogOut className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="font-medium">Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Iniciar Sesión</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signin">Comenzar</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t md:hidden">
          <div className="px-2 pb-3 pt-2">
            {session && (
              <>
                <div className="space-y-1">
                  <Link
                    href="/dashboard"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Dashboard
                  </Link>
                  {planningItems.map((item) => (
                    item.action ? (
                      <div
                        key={item.title}
                        onClick={item.action}
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
                      >
                        {item.title}
                      </div>
                    ) : (
                      <Link
                        key={item.title}
                        href={item.href!}
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      >
                        {item.title}
                      </Link>
                    )
                  ))}
                  <Link
                    href="/profile"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Mi Perfil
                  </Link>
                  <Link
                    href="/settings"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Configuración
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Trip Modal */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <TripForm
            onSubmit={handleCreateTrip}
            onCancel={() => setShowCreateForm(false)}
            isLoading={formLoading}
            mode="create"
          />
        </DialogContent>
      </Dialog>
    </nav>
  )
}

// This will be set inside the component
let planningItems: any[] = []

export function getPlanningItems(openCreateModal: () => void) {
  return [
    {
      title: 'Mis Viajes',
      href: '/trips',
      description: 'Ver y gestionar todos tus viajes',
      icon: Plane,
    },
    {
      title: 'Nuevo Viaje',
      action: openCreateModal,
      description: 'Crear un nuevo viaje',
      icon: Calendar,
    },
  ]
}