import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Map, Plane, Calendar, CreditCard, FileText, Camera } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="heading-1 text-4xl sm:text-6xl">
            Plan Your
            <span className="gradient-primary bg-clip-text text-transparent">
              {' '}Perfect Trip
            </span>
          </h1>
          <p className="body-large mt-6 text-lg leading-8 text-gray-600">
            Organize, plan, and visualize all aspects of your travels in one place. 
            From flights to activities, budget to memories - we've got you covered.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="heading-2">Everything you need for your trip</h2>
            <p className="body-medium mt-4 text-gray-600">
              A comprehensive suite of tools to make travel planning effortless and enjoyable.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <Card className="h-full transition-all hover:shadow-lg">
                    <CardHeader>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                        <feature.icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <CardTitle className="text-lg">{feature.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="body-small">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="heading-2 text-white">
              Ready to plan your next adventure?
            </h2>
            <p className="body-medium mt-6 text-primary-100">
              Join thousands of travelers who trust us to organize their perfect trips.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button variant="secondary" size="lg" asChild>
                <Link href="/dashboard">Start Planning</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    name: 'Smart Itinerary Planning',
    description: 'Create detailed day-by-day itineraries with activities, timing, and location mapping.',
    icon: Calendar,
  },
  {
    name: 'Transportation Management',
    description: 'Track flights, trains, buses, and other transportation with confirmation codes and schedules.',
    icon: Plane,
  },
  {
    name: 'Budget Tracking',
    description: 'Set budgets by category and track expenses in real-time to stay on target.',
    icon: CreditCard,
  },
  {
    name: 'Interactive Maps',
    description: 'Visualize your trip with interactive maps showing activities, hotels, and routes.',
    icon: Map,
  },
  {
    name: 'Document Storage',
    description: 'Securely store tickets, reservations, passports, and other important travel documents.',
    icon: FileText,
  },
  {
    name: 'Photo Gallery',
    description: 'Organize and preserve your travel memories with geotagged photo galleries.',
    icon: Camera,
  },
]