# 🌍 Travel Planner

A comprehensive web application for planning, organizing, and visualizing all aspects of your travels. Built with Next.js 14, TypeScript, Tailwind CSS, and modern development tools.

## ✨ Features

- **Smart Itinerary Planning** - Create detailed day-by-day itineraries with activities and timing
- **Transportation Management** - Track flights, trains, buses with confirmation codes
- **Budget Tracking** - Set budgets by category and track expenses in real-time
- **Interactive Maps** - Visualize your trip with maps showing activities and routes
- **Document Storage** - Securely store tickets, reservations, and travel documents
- **Photo Gallery** - Organize travel memories with geotagged photo galleries
- **Multi-user Support** - Each user has their own private travel plans
- **Mobile Responsive** - Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

### Backend & Database
- **NextAuth.js** - Authentication with Google/GitHub
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Robust relational database
- **tRPC** - End-to-end type safety (future)

### Development Tools
- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Lint-staged** - Pre-commit linting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials (optional)
- GitHub OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd travel-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/travel_planner"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-here"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_ID="your-github-client-id"
   GITHUB_SECRET="your-github-client-secret"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # Optional: Open Prisma Studio
   npm run db:studio
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── trips/             # Trip management
│   ├── itinerary/         # Itinerary planning
│   ├── transportation/    # Transportation tracking
│   ├── accommodation/     # Accommodation management
│   ├── activities/        # Activities and places
│   ├── budget/            # Budget and expenses
│   ├── documents/         # Document storage
│   ├── gallery/           # Photo gallery
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   └── maps/              # Map components
├── lib/                   # Utility libraries
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # Prisma client
│   ├── utils.ts           # Utility functions
│   └── validations/       # Zod schemas
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── styles/                # Global styles
└── utils/                 # Helper functions

prisma/
├── schema.prisma          # Database schema
└── migrations/            # Database migrations
```

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM. Key entities include:

- **Users** - User accounts and authentication
- **Trips** - Travel plans with dates and destinations
- **Itinerary** - Daily plans and schedules
- **Activities** - Places to visit and things to do
- **Transportation** - Flights, trains, buses, etc.
- **Accommodation** - Hotels, hostels, Airbnb
- **Budget & Expenses** - Financial planning and tracking
- **Documents** - Travel documents and files
- **Photos** - Trip photo gallery
- **Notes** - Trip notes and reminders

## 🎨 Design System

The application follows a comprehensive design system with:

- **Color Palette** - Primary blues, success greens, warning oranges
- **Typography** - Inter (body) and Manrope (headings) fonts
- **Spacing** - 8px base grid system
- **Components** - Consistent shadcn/ui components
- **Responsive Design** - Mobile-first approach

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
npm run format:check     # Check Prettier formatting
npm run type-check       # TypeScript type checking

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database (when implemented)
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel dashboard
4. Deploy automatically on every push

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
# ... other environment variables
```

## 📈 Roadmap

### Phase 1: Foundation (Completed)
- ✅ Project setup and configuration
- ✅ Authentication system
- ✅ Database schema
- ✅ Basic UI components
- ✅ Navigation and layout

### Phase 2: Core Features (In Progress)
- [ ] Trip CRUD operations
- [ ] Itinerary management
- [ ] Transportation tracking
- [ ] Activity planning
- [ ] Basic dashboard

### Phase 3: Advanced Features
- [ ] Budget and expense tracking
- [ ] Document management
- [ ] Photo gallery
- [ ] Interactive maps
- [ ] Sharing and collaboration

### Phase 4: Enhancements
- [ ] Mobile app (React Native)
- [ ] Offline support (PWA)
- [ ] AI-powered suggestions
- [ ] Third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Prisma](https://prisma.io/) - Next-generation ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js

---

**Ready to plan your next adventure?** 🌟