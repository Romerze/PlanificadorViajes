# 🌍 Sistema Web Personal para Planificación de Viajes
## Plan de Desarrollo Completo

### 🎯 Objetivo del Proyecto
Crear una aplicación web que permita planificar, organizar y visualizar todos los aspectos de los viajes, desde el transporte hasta el itinerario diario, de manera sencilla, visual y completamente personalizada.

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico Recomendado

#### Frontend
- **Framework**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Estado**: React Query/TanStack Query
- **Formularios**: React Hook Form + Zod validation
- **Mapas**: Google Maps API
- **Iconos**: Lucide React

#### Backend
- **Runtime**: Node.js + Express.js
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: NextAuth.js o JWT
- **Almacenamiento**: Cloudinary (imágenes) + AWS S3 (documentos)
- **API**: RESTful con posible migración a GraphQL

#### DevOps & Deployment
- **Containerización**: Docker
- **Hosting**: Vercel (Frontend) + Railway/PlanetScale (Backend/DB)
- **CI/CD**: GitHub Actions

---

## 🗃️ Estructura de Base de Datos

### Entidades Principales

```sql
-- Usuarios
Users {
  id: UUID PK
  email: String UNIQUE
  name: String
  avatar_url: String?
  created_at: DateTime
  updated_at: DateTime
}

-- Viajes
Trips {
  id: UUID PK
  user_id: UUID FK -> Users.id
  name: String
  destination: String
  description: Text?
  start_date: Date
  end_date: Date
  cover_image_url: String?
  status: Enum(planning, active, completed)
  created_at: DateTime
  updated_at: DateTime
}

-- Itinerario Diario
Itinerary {
  id: UUID PK
  trip_id: UUID FK -> Trips.id
  date: Date
  notes: Text?
  created_at: DateTime
  updated_at: DateTime
}

-- Actividades del Itinerario
ItineraryActivities {
  id: UUID PK
  itinerary_id: UUID FK -> Itinerary.id
  activity_id: UUID FK -> Activities.id
  start_time: Time?
  end_time: Time?
  order: Integer
  notes: Text?
}

-- Transporte
Transportation {
  id: UUID PK
  trip_id: UUID FK -> Trips.id
  type: Enum(flight, bus, train, car, boat, other)
  company: String?
  departure_location: String
  arrival_location: String
  departure_datetime: DateTime
  arrival_datetime: DateTime
  confirmation_code: String?
  price: Decimal?
  currency: String?
  notes: Text?
  created_at: DateTime
}

-- Hospedaje
Accommodation {
  id: UUID PK
  trip_id: UUID FK -> Trips.id
  name: String
  type: Enum(hotel, hostel, airbnb, apartment, house, other)
  address: String
  latitude: Decimal?
  longitude: Decimal?
  check_in_date: Date
  check_out_date: Date
  price_per_night: Decimal?
  total_price: Decimal?
  currency: String?
  booking_url: String?
  confirmation_code: String?
  rating: Integer? -- 1-5
  notes: Text?
  created_at: DateTime
}

-- Actividades y Lugares
Activities {
  id: UUID PK
  trip_id: UUID FK -> Trips.id
  name: String
  category: Enum(cultural, food, nature, adventure, shopping, entertainment, other)
  address: String?
  latitude: Decimal?
  longitude: Decimal?
  price: Decimal?
  currency: String?
  duration_hours: Decimal?
  opening_hours: String?
  website_url: String?
  phone: String?
  notes: Text?
  rating: Integer? -- 1-5
  created_at: DateTime
}

-- Presupuesto
Budget {
  id: UUID PK
  trip_id: UUID FK -> Trips.id
  category: Enum(transport, accommodation, food, activities, shopping, emergency, other)
  planned_amount: Decimal
  actual_amount: Decimal DEFAULT 0
  currency: String
  notes: Text?
  created_at: DateTime
  updated_at: DateTime
}

-- Gastos
Expenses {
  id: UUID PK
  trip_id: UUID FK -> Trips.id
  budget_id: UUID FK -> Budget.id
  description: String
  amount: Decimal
  currency: String
  date: Date
  category: String
  location: String?
  receipt_url: String?
  notes: Text?
  created_at: DateTime
}

-- Documentos
Documents {
  id: UUID PK
  trip_id: UUID FK -> Trips.id
  name: String
  type: Enum(passport, visa, ticket, reservation, insurance, other)
  file_url: String
  file_type: String
  file_size: Integer
  expiry_date: Date?
  notes: Text?
  created_at: DateTime
}

-- Galería de Fotos
Photos {
  id: UUID PK
  trip_id: UUID FK -> Trips.id
  itinerary_id: UUID FK -> Itinerary.id?
  activity_id: UUID FK -> Activities.id?
  file_url: String
  thumbnail_url: String?
  caption: Text?
  taken_at: DateTime?
  latitude: Decimal?
  longitude: Decimal?
  created_at: DateTime
}

-- Notas del Viaje
TripNotes {
  id: UUID PK
  trip_id: UUID FK -> Trips.id
  title: String?
  content: Text
  type: Enum(general, important, reminder, idea)
  created_at: DateTime
  updated_at: DateTime
}
```

---

## 🧩 Módulos del Sistema - Mapeo Completo

### ✅ Módulo 1: Inicio / Dashboard
**Estado**: Completamente mapeado
- [x] Ver próximos viajes → Query a `Trips` donde `start_date >= today`
- [x] Accesos rápidos → Lista de `Trips` ordenados por `updated_at`
- [x] Resumen de gastos → Agregación de `Expenses` por `trip_id`
- [x] Destinos visitados → Count de `Trips` con `status = completed`

### ✅ Módulo 2: Gestión de Viajes
**Estado**: Completamente mapeado
- [x] Crear nuevo viaje → CRUD en tabla `Trips`
- [x] Ver viajes anteriores → Query con filtros por `status` y fechas
- [x] Duplicar planificaciones → Clonar registro de `Trips` y relaciones

### ✅ Módulo 3: Itinerario Diario
**Estado**: Completamente mapeado
- [x] Vista día por día → Tabla `Itinerary` + `ItineraryActivities`
- [x] Agregar actividades por horario → Relación con `Activities`
- [x] Mapa visual → Usando coordinates de `Activities` y `Accommodation`

### ✅ Módulo 4: Transporte Personalizado
**Estado**: Completamente mapeado
- [x] Añadir transportes → Tabla `Transportation` con todos los tipos
- [x] Fechas y horarios → Campos `departure_datetime`, `arrival_datetime`
- [x] Subida de boletos → Relación con tabla `Documents`

### ✅ Módulo 5: Hospedaje
**Estado**: Completamente mapeado
- [x] Añadir alojamientos → Tabla `Accommodation`
- [x] Dirección y precio → Campos específicos + geolocalización
- [x] Fotos y links → Campo `booking_url` + relación con `Photos`

### ✅ Módulo 6: Actividades y Lugares
**Estado**: Completamente mapeado
- [x] Lista con categorías → Tabla `Activities` con enum `category`
- [x] Información detallada → Campos completos (dirección, precio, horarios)
- [x] Marcado en mapa → Campos `latitude`, `longitude`

### ✅ Módulo 7: Presupuesto y Gastos
**Estado**: Completamente mapeado
- [x] Presupuesto por categoría → Tabla `Budget`
- [x] Gastos reales → Tabla `Expenses` vinculada a `Budget`
- [x] Comparación visual → Cálculos entre `planned_amount` y `actual_amount`

### ✅ Módulo 8: Notas y Documentos
**Estado**: Completamente mapeado
- [x] Notas personales → Tabla `TripNotes`
- [x] Subida de archivos → Tabla `Documents` con diferentes tipos
- [x] Organización → Categorización por `type`

### ✅ Módulo 9: Galería del Viaje
**Estado**: Completamente mapeado
- [x] Fotos por día → Tabla `Photos` vinculada a `Itinerary`
- [x] Fotos por actividad → Relación con `Activities`
- [x] Bitácora visual → Ordenamiento por `taken_at` y geolocalización

---

## 🚀 Plan de Desarrollo - 5 Fases

### 📋 Fase 1: Fundación (2-3 semanas)
**Objetivo**: Establecer la base del proyecto

#### Semana 1-2: Setup Inicial
- [ ] Configuración del repositorio y estructura de carpetas
- [ ] Setup de Next.js + TypeScript + Tailwind
- [ ] Configuración de Prisma + PostgreSQL
- [ ] Setup de shadcn/ui y componentes base
- [ ] Configuración de ESLint, Prettier, Husky

#### Semana 2-3: Autenticación y Base
- [ ] Implementar sistema de autenticación (NextAuth.js)
- [ ] Crear modelos de base de datos iniciales (Users, Trips)
- [ ] Implementar CRUD básico de viajes
- [ ] Crear layout base y navegación
- [ ] Dashboard inicial con lista de viajes

**Entregables**:
- ✅ Proyecto funcionando localmente
- ✅ Autenticación completa
- ✅ CRUD básico de viajes
- ✅ Dashboard funcional

---

### 📋 Fase 2: Core Features (3-4 semanas)
**Objetivo**: Implementar funcionalidades principales

#### Semana 4-5: Itinerario y Transporte
- [ ] Crear modelos de Itinerary e ItineraryActivities
- [ ] Implementar vista de itinerario día por día
- [ ] Sistema de transporte completo
- [ ] Formularios para crear/editar transportes
- [ ] Vista timeline del viaje

#### Semana 6-7: Hospedaje y Actividades
- [ ] Implementar gestión de hospedaje
- [ ] Sistema de actividades y lugares
- [ ] Categorización de actividades
- [ ] Formularios avanzados con validación
- [ ] Vista de resumen del viaje

**Entregables**:
- ✅ Gestión completa de itinerario
- ✅ Sistema de transporte funcional
- ✅ Gestión de hospedaje
- ✅ Base de actividades

---

### 📋 Fase 3: Funcionalidades Avanzadas (2-3 semanas)
**Objetivo**: Integrar mapas y presupuesto

#### Semana 8-9: Mapas y Geolocalización
- [ ] Integración con Google Maps API
- [ ] Mostrar puntos de interés en mapa
- [ ] Geocodificación de direcciones
- [ ] Vista de mapa interactivo del viaje
- [ ] Rutas entre puntos

#### Semana 9-10: Presupuesto y Documentos
- [ ] Sistema de presupuesto por categorías
- [ ] Registro de gastos reales
- [ ] Gráficos de comparación presupuesto vs real
- [ ] Sistema de subida de documentos
- [ ] Organización de archivos por tipo

**Entregables**:
- ✅ Integración completa con mapas
- ✅ Sistema de presupuesto funcional
- ✅ Gestión de documentos

---

### 📋 Fase 4: Experiencia de Usuario (2 semanas)
**Objetivo**: Mejorar UX/UI y añadir galería

#### Semana 11: Galería y Notas
- [ ] Sistema de galería de fotos
- [ ] Subida múltiple de imágenes
- [ ] Organización por día/actividad
- [ ] Sistema de notas del viaje
- [ ] Editor de texto enriquecido

#### Semana 12: UX/UI Improvements
- [ ] Responsive design completo
- [ ] Animaciones y transiciones
- [ ] Dark mode
- [ ] Optimización de rendimiento
- [ ] Loading states y error handling

**Entregables**:
- ✅ Galería completa y funcional
- ✅ Sistema de notas
- ✅ UX/UI pulida y responsive

---

### 📋 Fase 5: Pulimiento y Deploy (1-2 semanas)
**Objetivo**: Testing, optimización y deployment

#### Semana 13: Testing y Optimización
- [ ] Tests unitarios (componentes críticos)
- [ ] Tests de integración (API routes)
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Accessibility improvements

#### Semana 14: Deployment
- [ ] Setup de CI/CD con GitHub Actions
- [ ] Deploy a producción (Vercel + PlanetScale)
- [ ] Configuración de dominio
- [ ] Monitoring y analytics
- [ ] Documentación final

**Entregables**:
- ✅ Aplicación completamente testada
- ✅ Deploy en producción
- ✅ Documentación completa

---

## 🎯 MVP (Producto Mínimo Viable)

### Funcionalidades Esenciales (Fases 1-2)
1. ✅ **Autenticación de usuarios**
2. ✅ **Gestión básica de viajes** (crear, editar, eliminar)
3. ✅ **Itinerario día por día** con actividades
4. ✅ **Gestión de transporte** (vuelos, buses, etc.)
5. ✅ **Gestión de hospedaje** básica
6. ✅ **Dashboard** con próximos viajes y resumen

### Métricas de Éxito del MVP
- [ ] Usuario puede crear un viaje completo en < 10 minutos
- [ ] Todas las funciones core funcionan sin errores
- [ ] Interfaz responsive en mobile y desktop
- [ ] Tiempo de carga < 3 segundos

---

## 📊 Estimaciones y Timeline

### Resumen de Tiempos
- **Fase 1**: 2-3 semanas (Fundación)
- **Fase 2**: 3-4 semanas (Core Features)
- **Fase 3**: 2-3 semanas (Funcionalidades Avanzadas)
- **Fase 4**: 2 semanas (UX/UI)
- **Fase 5**: 1-2 semanas (Deploy)

**Total estimado**: 10-14 semanas (2.5-3.5 meses)

### Recursos Necesarios
- **1 Desarrollador Full-Stack** (dedicación completa)
- **Google Maps API** (cuenta y billing)
- **Servicios de hosting** (Vercel + PlanetScale/Railway)
- **Servicios de almacenamiento** (Cloudinary)

---

## 🔄 Próximos Pasos

1. **Validar el plan** con stakeholders
2. **Setup del entorno de desarrollo** (Fase 1)
3. **Crear repositorio** y estructura inicial
4. **Definir criterios de aceptación** para cada feature
5. **Comenzar desarrollo** siguiendo las fases definidas

---

## 📝 Notas Adicionales

### Consideraciones Técnicas
- **Escalabilidad**: Estructura preparada para múltiples usuarios
- **Seguridad**: Validación en frontend y backend
- **Performance**: Lazy loading, optimización de imágenes
- **Offline**: Considerar PWA para acceso offline

### Funcionalidades Futuras (Post-MVP)
- Compartir viajes con otros usuarios
- Plantillas de viajes por destino
- Integración con booking sites
- App móvil nativa
- IA para sugerencias de actividades
- Importación desde email/PDF

---

*Documento actualizado: $(date)*
*Versión: 1.0*