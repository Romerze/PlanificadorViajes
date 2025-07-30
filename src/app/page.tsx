import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, Compass, Mountain, Plane } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 flex items-center justify-center relative overflow-hidden">
      {/* Nature Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-green-200/30 to-emerald-300/40 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-16 w-80 h-80 bg-gradient-to-tl from-blue-200/30 to-sky-300/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-br from-teal-200/20 to-cyan-300/30 rounded-full blur-2xl" />
      </div>

      {/* Mountain Silhouettes */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-200/20 to-transparent">
        <svg viewBox="0 0 1200 200" className="w-full h-full">
          <path d="M0,200 L200,80 L400,120 L600,40 L800,100 L1000,60 L1200,140 L1200,200 Z" fill="rgba(34, 197, 94, 0.1)" />
          <path d="M0,200 L150,120 L350,160 L550,90 L750,140 L950,100 L1200,180 L1200,200 Z" fill="rgba(14, 165, 233, 0.08)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        
        {/* Adventure Badge */}
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200/60 rounded-full px-6 py-3 mb-8 shadow-lg">
          <Mountain className="h-4 w-4 text-emerald-600" />
          <span className="text-emerald-800 font-medium text-sm">Tu próxima aventura comienza aquí</span>
        </div>

        {/* Main Hero */}
        <div className="mb-12">
          <h1 className="text-6xl lg:text-7xl font-bold text-slate-800 leading-tight mb-6">
            Planifica tu
            <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">
              Gran Aventura
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
            Organiza itinerarios únicos, descubre destinos increíbles y vive experiencias que recordarás para siempre.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
          <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <Link href="/dashboard">
              <Compass className="mr-2 h-5 w-5" />
              Comenzar a Explorar
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold px-8 py-4 text-lg backdrop-blur-sm bg-white/50 hover:text-gray-500">
            <Link href="/auth/signin">
              <MapPin className="mr-2 h-4 w-4" />
              Ver Destinos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}