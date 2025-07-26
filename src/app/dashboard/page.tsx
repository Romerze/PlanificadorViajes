import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/navbar'
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  TrendingUp,
  Plus,
  Plane,
  Clock,
  Target
} from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="heading-1">Welcome back, {session.user?.name?.split(' ')[0]}</h1>
            <p className="body-medium text-muted-foreground mt-2">
              Ready to plan your next adventure?
            </p>
          </div>
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            New Trip
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Trips"
            value="0"
            description="All time"
            icon={Plane}
            trend="+0%"
          />
          <StatsCard
            title="Active Trips"
            value="0"
            description="Currently planned"
            icon={Clock}
            trend="+0%"
          />
          <StatsCard
            title="Countries Visited"
            value="0"
            description="Destinations"
            icon={MapPin}
            trend="+0%"
          />
          <StatsCard
            title="Total Spent"
            value="$0"
            description="This year"
            icon={DollarSign}
            trend="+0%"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Trips */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Trips
                </CardTitle>
                <CardDescription>
                  Your next adventures await
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Plane className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No trips planned yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Create your first trip to get started with planning.
                  </p>
                  <Button className="mt-4" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Plan Your First Trip
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks to help you plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Trip
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Add Activity
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Track Expense
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="mr-2 h-4 w-4" />
                  Find Places
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Travel Tips</CardTitle>
                <CardDescription>
                  Make the most of your trips
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Target className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Plan ahead</p>
                      <p className="text-muted-foreground">Book accommodations and activities early for better prices.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Set a budget</p>
                      <p className="text-muted-foreground">Track expenses to avoid overspending on your trip.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string
  description: string
  icon: React.ElementType
  trend: string
}

function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          {trend} from last month
        </p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}