
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Factory, Clock, Zap, Recycle, QrCode, Play, Pause, CheckCircle } from "lucide-react"

export function ProductionManager() {
  const [activeSection, setActiveSection] = useState<'overview' | 'stages' | 'tracking'>('overview')

  const productionStats = [
    { label: "Active Productions", value: "5", icon: Factory, color: "text-blue-400" },
    { label: "Avg. Time/Unit", value: "3.2h", icon: Clock, color: "text-purple-400" },
    { label: "Energy Usage", value: "24.5 kWh", icon: Zap, color: "text-yellow-400" },
    { label: "Waste Generated", value: "12.3 kg", icon: Recycle, color: "text-green-400" }
  ];

  const activeProductions = [
    {
      id: "1",
      projectName: "Scandinavian Dining Table",
      stage: "Cutting",
      progress: 45,
      timeStarted: "2 hours ago",
      estimatedCompletion: "4 hours",
      worker: "John Doe",
      status: "in_progress"
    },
    {
      id: "2", 
      projectName: "Modern Bookshelf",
      stage: "Assembly",
      progress: 80,
      timeStarted: "6 hours ago",
      estimatedCompletion: "1 hour",
      worker: "Jane Smith",
      status: "in_progress"
    },
    {
      id: "3",
      projectName: "Oak Coffee Table",
      stage: "Finishing",
      progress: 95,
      timeStarted: "1 day ago",
      estimatedCompletion: "30 minutes",
      worker: "Mike Johnson",
      status: "finishing"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'finishing': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Production</h1>
            <p className="text-muted-foreground">Monitor manufacturing progress, track time and energy consumption</p>
          </div>
          <Button className="gap-2">
            <QrCode className="h-4 w-4" />
            Generate Time Tracking QR
          </Button>
        </div>
      </div>

      <div className="px-8 py-4">
        <div className="max-w-7xl mx-auto space-y-6 ml-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {productionStats.map((stat) => (
              <Card key={stat.label} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation Tabs */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-2 mb-6 flex-wrap">
                <Button
                  variant={activeSection === 'overview' ? 'default' : 'outline'}
                  onClick={() => setActiveSection('overview')}
                  className="flex-1 min-w-[120px]"
                >
                  <Factory className="h-4 w-4 mr-2" />
                  Production Overview
                </Button>
                <Button
                  variant={activeSection === 'stages' ? 'default' : 'outline'}
                  onClick={() => setActiveSection('stages')}
                  className="flex-1 min-w-[120px]"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Manufacturing Stages
                </Button>
                <Button
                  variant={activeSection === 'tracking' ? 'default' : 'outline'}
                  onClick={() => setActiveSection('tracking')}
                  className="flex-1 min-w-[120px]"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Time Tracking
                </Button>
              </div>

              {/* Active Productions */}
              {activeSection === 'overview' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Active Productions</h3>
                  <div className="grid gap-4">
                    {activeProductions.map((production) => (
                      <Card key={production.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{production.projectName}</h4>
                              <p className="text-sm text-muted-foreground">Worker: {production.worker}</p>
                            </div>
                            <Badge className={getStatusColor(production.status)}>
                              {production.stage}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">Progress</span>
                              <span className="text-muted-foreground">{production.progress}%</span>
                            </div>
                            <Progress value={production.progress} className="h-2" />
                          </div>

                          <div className="flex justify-between text-sm text-muted-foreground mb-3">
                            <span>Started: {production.timeStarted}</span>
                            <span>Est. completion: {production.estimatedCompletion}</span>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Pause className="h-4 w-4 mr-1" />
                              Pause
                            </Button>
                            <Button size="sm" className="flex-1">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete Stage
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Manufacturing Stages */}
              {activeSection === 'stages' && (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Manufacturing Stages</h3>
                  <p className="text-muted-foreground">Detailed stage management and workflow configuration</p>
                </div>
              )}

              {/* Time Tracking */}
              {activeSection === 'tracking' && (
                <div className="text-center py-12">
                  <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">QR Time Tracking</h3>
                  <p className="text-muted-foreground">Generate QR codes for workers to track time and stage completion</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
