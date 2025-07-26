'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
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

export function Navbar() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Plane className="h-6 w-6 text-primary" />
          <span className="font-heading text-xl font-bold">TravelPlanner</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1 md:justify-center">
          {session && (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Planning</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {planningItems.map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={item.href}
                              className={cn(
                                'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                              )}
                            >
                              <div className="flex items-center space-x-2">
                                <item.icon className="h-4 w-4" />
                                <div className="text-sm font-medium leading-none">
                                  {item.title}
                                </div>
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {item.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/dashboard"
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                    >
                      Dashboard
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </div>

        {/* Right side */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={session.user?.image || ''} 
                      alt={session.user?.name || ''} 
                    />
                    <AvatarFallback>
                      {session.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signin">Get Started</Link>
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
                    <Link
                      key={item.title}
                      href={item.href}
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

const planningItems = [
  {
    title: 'Trips',
    href: '/trips',
    description: 'View and manage all your trips',
    icon: Plane,
  },
  {
    title: 'Itinerary',
    href: '/itinerary',
    description: 'Plan your daily activities',
    icon: Calendar,
  },
  {
    title: 'Transportation',
    href: '/transportation',
    description: 'Manage flights, trains, and more',
    icon: Plane,
  },
  {
    title: 'Budget',
    href: '/budget',
    description: 'Track expenses and budgets',
    icon: CreditCard,
  },
  {
    title: 'Maps',
    href: '/maps',
    description: 'Visualize your trip locations',
    icon: Map,
  },
  {
    title: 'Gallery',
    href: '/gallery',
    description: 'Store and organize photos',
    icon: Camera,
  },
  {
    title: 'Documents',
    href: '/documents',
    description: 'Keep important travel docs',
    icon: FileText,
  },
]