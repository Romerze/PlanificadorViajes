import { 
  Trip as PrismaTrip,
  User as PrismaUser,
  Activity as PrismaActivity,
  Transportation as PrismaTransportation,
  Accommodation as PrismaAccommodation,
  Budget as PrismaBudget,
  Expense as PrismaExpense,
  Document as PrismaDocument,
  Photo as PrismaPhoto,
  TripNote as PrismaTripNote,
  Itinerary as PrismaItinerary,
  ItineraryActivity as PrismaItineraryActivity,
  TripStatus,
  TransportType,
  AccommodationType,
  ActivityCategory,
  BudgetCategory,
  DocumentType,
  NoteType
} from '@prisma/client'

// Export Prisma enums
export {
  TripStatus,
  TransportType,
  AccommodationType,
  ActivityCategory,
  BudgetCategory,
  DocumentType,
  NoteType
}

// Extended types with relations
export type Trip = PrismaTrip & {
  user?: PrismaUser
  itineraries?: Itinerary[]
  transportation?: Transportation[]
  accommodation?: Accommodation[]
  activities?: Activity[]
  budget?: Budget[]
  expenses?: Expense[]
  documents?: Document[]
  photos?: Photo[]
  notes?: TripNote[]
  _count?: {
    itineraries: number
    transportation: number
    accommodation: number
    activities: number
    expenses: number
    documents: number
    photos: number
  }
}

export type User = PrismaUser & {
  trips?: Trip[]
}

export type Activity = PrismaActivity & {
  trip?: Trip
  itineraryActivities?: ItineraryActivity[]
  photos?: Photo[]
}

export type Transportation = PrismaTransportation & {
  trip?: Trip
}

export type Accommodation = PrismaAccommodation & {
  trip?: Trip
}

export type Budget = PrismaBudget & {
  trip?: Trip
  expenses?: Expense[]
}

export type Expense = PrismaExpense & {
  trip?: Trip
  budget?: Budget
}

export type Document = PrismaDocument & {
  trip?: Trip
}

export type Photo = PrismaPhoto & {
  trip?: Trip
  itinerary?: Itinerary
  activity?: Activity
}

export type TripNote = PrismaTripNote & {
  trip?: Trip
}

export type Itinerary = PrismaItinerary & {
  trip?: Trip
  activities?: ItineraryActivity[]
  photos?: Photo[]
}

export type ItineraryActivity = PrismaItineraryActivity & {
  itinerary?: Itinerary
  activity?: Activity
}

// Form types
export type CreateTripInput = {
  name: string
  destination: string
  description?: string
  startDate: Date
  endDate: Date
  coverImageUrl?: string
}

export type UpdateTripInput = Partial<CreateTripInput> & {
  id: string
  status?: TripStatus
}

export type CreateActivityInput = {
  tripId: string
  name: string
  category: ActivityCategory
  address?: string
  latitude?: number
  longitude?: number
  price?: number
  currency?: string
  durationHours?: number
  openingHours?: string
  websiteUrl?: string
  phone?: string
  notes?: string
  rating?: number
}

export type CreateTransportationInput = {
  tripId: string
  type: TransportType
  company?: string
  departureLocation: string
  arrivalLocation: string
  departureDatetime: Date
  arrivalDatetime: Date
  confirmationCode?: string
  price?: number
  currency?: string
  notes?: string
}

export type CreateAccommodationInput = {
  tripId: string
  name: string
  type: AccommodationType
  address: string
  latitude?: number
  longitude?: number
  checkInDate: Date
  checkOutDate: Date
  pricePerNight?: number
  totalPrice?: number
  currency?: string
  bookingUrl?: string
  confirmationCode?: string
  rating?: number
  notes?: string
}

// API Response types
export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Dashboard stats type
export type DashboardStats = {
  totalTrips: number
  activeTrips: number
  completedTrips: number
  totalExpenses: number
  upcomingTrips: Trip[]
  recentActivities: Activity[]
}