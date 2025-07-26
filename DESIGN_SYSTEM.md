# 🎨 Sistema de Diseño - Planificador de Viajes

## 🎯 Objetivo del Sistema de Diseño
Crear una experiencia visual profesional, cohesiva y escalable que transmita confianza, simplicidad y eficiencia en la planificación de viajes.

---

## 🎨 Paleta de Colores

### Colores Primarios
```css
/* Azul Viajero - Color principal */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Principal */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;

/* Verde Éxito */
--success-50: #f0fdf4;
--success-100: #dcfce7;
--success-200: #bbf7d0;
--success-300: #86efac;
--success-400: #4ade80;
--success-500: #22c55e;  /* Principal */
--success-600: #16a34a;
--success-700: #15803d;
--success-800: #166534;
--success-900: #14532d;

/* Naranja Aventura */
--warning-50: #fff7ed;
--warning-100: #ffedd5;
--warning-200: #fed7aa;
--warning-300: #fdba74;
--warning-400: #fb923c;
--warning-500: #f97316;  /* Principal */
--warning-600: #ea580c;
--warning-700: #c2410c;
--warning-800: #9a3412;
--warning-900: #7c2d12;

/* Rojo Error */
--error-50: #fef2f2;
--error-100: #fee2e2;
--error-200: #fecaca;
--error-300: #fca5a5;
--error-400: #f87171;
--error-500: #ef4444;  /* Principal */
--error-600: #dc2626;
--error-700: #b91c1c;
--error-800: #991b1b;
--error-900: #7f1d1d;
```

### Colores Neutros
```css
/* Grises Modernos */
--gray-50: #f8fafc;
--gray-100: #f1f5f9;
--gray-200: #e2e8f0;
--gray-300: #cbd5e1;
--gray-400: #94a3b8;
--gray-500: #64748b;
--gray-600: #475569;
--gray-700: #334155;
--gray-800: #1e293b;
--gray-900: #0f172a;

/* Especiales */
--white: #ffffff;
--black: #000000;
--background: #fafafa;
--surface: #ffffff;
--border: #e2e8f0;
--text-primary: #0f172a;
--text-secondary: #64748b;
--text-muted: #94a3b8;
```

### Colores Temáticos por Módulo
```css
/* Transporte */
--transport-flight: #0ea5e9;    /* Azul cielo */
--transport-car: #059669;       /* Verde carretera */
--transport-train: #7c3aed;     /* Púrpura */
--transport-bus: #dc2626;       /* Rojo */

/* Hospedaje */
--accommodation-hotel: #c2410c;   /* Naranja hotel */
--accommodation-hostel: #7c2d12;  /* Marrón hostel */
--accommodation-airbnb: #dc2626;  /* Rojo Airbnb */

/* Actividades */
--activity-cultural: #7c3aed;     /* Púrpura */
--activity-food: #dc2626;         /* Rojo */
--activity-nature: #059669;       /* Verde */
--activity-adventure: #ea580c;    /* Naranja */
--activity-shopping: #ec4899;     /* Rosa */
--activity-entertainment: #8b5cf6; /* Índigo */
```

---

## 📝 Tipografía

### Fuentes Principales
```css
/* Fuente Principal - Inter (Google Fonts) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');

/* Fuente Secundaria - Manrope (Títulos) */
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap');

--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-secondary: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Escala Tipográfica
```css
/* Títulos */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
--text-6xl: 3.75rem;    /* 60px */

/* Pesos */
--font-thin: 100;
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
--font-black: 900;

/* Altura de línea */
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Clases de Texto Estandarizadas
```css
.heading-1 {
  font-family: var(--font-secondary);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--text-primary);
}

.heading-2 {
  font-family: var(--font-secondary);
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--text-primary);
}

.heading-3 {
  font-family: var(--font-secondary);
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--text-primary);
}

.body-large {
  font-family: var(--font-primary);
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
}

.body-medium {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--text-primary);
}

.body-small {
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}

.caption {
  font-family: var(--font-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

## 📏 Espaciado y Layout

### Sistema de Espaciado (8px base)
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

### Bordes y Radios
```css
--radius-none: 0;
--radius-sm: 0.125rem;    /* 2px */
--radius-base: 0.25rem;   /* 4px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-3xl: 1.5rem;     /* 24px */
--radius-full: 9999px;

--border-width: 1px;
--border-width-2: 2px;
--border-width-4: 4px;
```

### Sombras
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
```

---

## 🧩 Componentes Base

### Botones
```typescript
// Button variants
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  variant: ButtonVariant;
  size: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}
```

**Especificaciones visuales**:
- **Primary**: Background azul primary-500, texto blanco, hover primary-600
- **Secondary**: Background gray-100, texto gray-900, hover gray-200
- **Outline**: Border primary-500, texto primary-500, hover background primary-50
- **Ghost**: Texto primary-500, hover background primary-50
- **Destructive**: Background error-500, texto blanco, hover error-600

### Cards
```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
}
```

**Especificaciones visuales**:
- **Default**: Background blanco, border gray-200
- **Elevated**: Background blanco, shadow-md
- **Outlined**: Background blanco, border gray-300, sin sombra
- **Hover**: Transform scale(1.02), shadow-lg (solo si hoverable)

### Inputs
```typescript
interface InputProps {
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  state?: 'default' | 'error' | 'success' | 'disabled';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}
```

---

## 🚀 Patrones de Interacción

### Estados de Loading
1. **Skeleton Loading**: Para listas y cards
2. **Spinner**: Para acciones puntuales
3. **Progress Bar**: Para procesos largos
4. **Shimmer**: Para imágenes

### Feedback al Usuario
1. **Toast Notifications**: Confirmaciones y errores
2. **Modal Confirmations**: Acciones destructivas
3. **Inline Validation**: Formularios en tiempo real
4. **Status Badges**: Estados de elementos

### Animaciones
```css
/* Transiciones base */
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;

/* Easing functions */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 📱 Responsive Design

### Breakpoints
```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Grid System
- **Mobile**: 1 columna, spacing 4
- **Tablet**: 2-3 columnas, spacing 6
- **Desktop**: 3-4 columnas, spacing 8
- **Large**: 4-6 columnas, spacing 12

---

## 🎯 Reglas de Aplicación

### Consistencia Entre Módulos

#### 1. Headers de Módulo
```typescript
interface ModuleHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}
```

Todos los módulos deben usar el mismo patrón de header con:
- Título principal (heading-2)
- Subtitle opcional (body-medium, text-secondary)
- Acciones alineadas a la derecha
- Breadcrumbs cuando aplique

#### 2. Listas y Cards
- **Spacing consistente**: gap-6 entre cards
- **Hover states**: Siempre implementar para elementos interactivos
- **Loading states**: Skeleton loaders con mismas dimensiones
- **Empty states**: Ilustración + mensaje + CTA consistente

#### 3. Formularios
- **Labels**: Siempre caption class, color text-secondary
- **Required fields**: Asterisco rojo (*) después del label
- **Validation**: Inline errors en color error-500
- **Submit buttons**: Siempre primary variant, full width en mobile

#### 4. Navegación
- **Active state**: primary-500 background con texto blanco
- **Hover state**: primary-50 background
- **Icons**: Siempre 20px, stroke-width 1.5
- **Spacing**: padding-x 3, padding-y 2

### Iconografía
- **Librería**: Lucide React exclusivamente
- **Tamaño estándar**: 20px (1.25rem)
- **Stroke**: 1.5px para consistencia
- **Color**: Hereda del texto padre

### Microinteracciones
1. **Hover**: Todos los elementos interactivos
2. **Focus**: Ring primary-500 con offset
3. **Active**: Scale down 0.95 para botones
4. **Loading**: Opacity 0.6 + disabled cursor

---

## 🔍 Checklist de Implementación

### ✅ Por Componente
- [ ] Implementa design tokens correctos
- [ ] Responsive en todos los breakpoints
- [ ] Estados de hover/focus/active
- [ ] Loading y error states
- [ ] Accesibilidad (ARIA labels, keyboard navigation)
- [ ] TypeScript interfaces completas
- [ ] Documentación en Storybook

### ✅ Por Módulo
- [ ] Header consistente implementado
- [ ] Cards siguen patrón estándar
- [ ] Formularios con validación uniforme
- [ ] Empty states con mismo patrón
- [ ] Loading states consistentes
- [ ] Error handling uniformizado
- [ ] Mobile-first responsive

### ✅ Testing de Consistencia
- [ ] Visual regression tests
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Accessibility audit
- [ ] Performance audit

---

## 📚 Recursos y Referencias

### Inspiración de Diseño
- **Airbnb**: Navegación y cards de destinos
- **Booking.com**: Formularios y filtros
- **Google Travel**: Layout y mapas
- **Notion**: Sistema de componentes
- **Linear**: Micro-interacciones

### Herramientas
- **Figma**: Design system y prototipos
- **Storybook**: Documentación de componentes
- **Chromatic**: Visual testing
- **Lighthouse**: Performance y accessibility

---

*Sistema de diseño v1.0 - Actualizado: $(date)*