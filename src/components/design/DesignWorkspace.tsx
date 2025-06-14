
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Layers, Package, Clock, Users, Zap, Calculator, Recycle, Truck, Box } from "lucide-react";
import { TimeLogging } from "@/components/project/TimeLogging";
import { ManufacturingStages } from "@/components/project/ManufacturingStages";
import { LaborCalculator } from "@/components/project/LaborCalculator";
import { EnergyEstimator } from "@/components/project/EnergyEstimator";
import { TransportEmissions } from "@/components/carbon/TransportEmissions";
import { ShippingTracker } from "@/components/shipping/ShippingTracker";
import { TakebackSystem } from "@/components/lifecycle/TakebackSystem";
import { CircularDesign } from "@/components/design/CircularDesign";

export function DesignWorkspace() {
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);

  const projects = [
    {
      id: 1,
      name: "Eco-Chair Series",
      status: "In Progress",
      completion: 75,
      materials: [
        { name: "Reclaimed Oak", allocated: 8, unit: "boards" },
        { name: "Hemp Fiber", allocated: 2, unit: "rolls" },
        { name: "Bio-resin", allocated: 1.5, unit: "L" }
      ],
      offcuts: [
        { material: "Oak offcuts", quantity: "12 pieces", dimension: "200x100x25mm" },
        { material: "Hemp scraps", quantity: "0.3 kg", dimension: "Various" }
      ],
      timeline: "Due: March 15, 2024",
      carbonBudget: { allocated: 45.2, used: 32.8, unit: "kg CO₂" },
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop"
    },
    {
      id: 2,
      name: "Sustainable Desk Collection",
      status: "Needs Materials",
      completion: 45,
      materials: [
        { name: "Bamboo Plywood", allocated: 6, unit: "sheets" },
        { name: "Recycled Steel", allocated: 4, unit: "tubes" },
        { name: "Cork Panels", allocated: 0, unit: "sheets", needed: 3 }
      ],
      offcuts: [],
      timeline: "Due: April 20, 2024",
      carbonBudget: { allocated: 78.5, used: 25.4, unit: "kg CO₂" },
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop"
    },
    {
      id: 3,
      name: "Modular Shelving System",
      status: "Assembly",
      completion: 90,
      materials: [
        { name: "Recycled Aluminum", allocated: 12, unit: "profiles" },
        { name: "Bamboo Shelves", allocated: 8, unit: "pieces" }
      ],
      offcuts: [
        { material: "Aluminum cuts", quantity: "8 pieces", dimension: "150mm lengths" },
        { material: "Bamboo edges", quantity: "6 pieces", dimension: "50x610mm" }
      ],
      timeline: "Due: February 28, 2024",
      carbonBudget: { allocated: 32.1, used: 28.9, unit: "kg CO₂" },
      image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&h=200&fit=crop"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-500';
      case 'Needs Materials': return 'bg-orange-500';
      case 'Assembly': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'In Progress': return 'default';
      case 'Needs Materials': return 'destructive';
      case 'Assembly': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Design Workspace</h1>
          <p className="text-muted-foreground mt-1">Track your sustainable design projects and material allocation</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Project Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Layers className="h-6 w-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Materials Allocated</p>
                <p className="text-2xl font-bold">43</p>
              </div>
              <Package className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold">70%</p>
              </div>
              <Clock className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Carbon Budget</p>
                <p className="text-2xl font-bold">87.1</p>
                <p className="text-xs text-muted-foreground">kg CO₂ used</p>
              </div>
              <div className="text-primary">CO₂</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Project Management */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          
          {/* Phase 1 tabs */}
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
          <TabsTrigger value="labor">Labor & Costs</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          
          {/* Phase 2 tabs */}
          <TabsTrigger value="transport">Transport</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="takeback">Take-back</TabsTrigger>
          <TabsTrigger value="circular">Circular Design</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="sentiri-card hover:border-accent/30 transition-all duration-200">
                <div className="relative">
                  <img 
                    src={project.image} 
                    alt={project.name}
                    className="w-full h-40 object-cover rounded-t-xl"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant={getStatusVariant(project.status)}
                      className={project.status === 'Assembly' ? 'bg-primary' : ''}
                    >
                      {project.status}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">{project.timeline}</p>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.completion}%</span>
                    </div>
                    <Progress value={project.completion} className="h-2" />
                  </div>

                  {/* Materials */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Allocated Materials</h4>
                    <div className="space-y-1">
                      {project.materials.map((material, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className={material.needed ? 'text-orange-400' : 'text-muted-foreground'}>
                            {material.name}
                          </span>
                          <span className={material.needed ? 'text-orange-400 font-medium' : ''}>
                            {material.needed ? `Need ${material.needed}` : `${material.allocated} ${material.unit}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Carbon Budget */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Carbon Budget</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Used</span>
                      <span className="text-primary font-medium">
                        {project.carbonBudget.used} / {project.carbonBudget.allocated} {project.carbonBudget.unit}
                      </span>
                    </div>
                    <Progress 
                      value={(project.carbonBudget.used / project.carbonBudget.allocated) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Offcuts */}
                  {project.offcuts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-primary">Available Offcuts</h4>
                      <div className="space-y-1">
                        {project.offcuts.map((offcut, index) => (
                          <div key={index} className="text-xs bg-primary/5 p-2 rounded border border-primary/20">
                            <span className="font-medium">{offcut.material}</span>
                            <br />
                            <span className="text-muted-foreground">{offcut.quantity} • {offcut.dimension}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Update Materials
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Phase 1 Components */}
        <TabsContent value="time">
          <TimeLogging 
            projectId="current-project" 
            onTimeUpdate={setTimeEntries}
          />
        </TabsContent>

        <TabsContent value="manufacturing">
          <ManufacturingStages 
            projectId="current-project"
            onStageUpdate={setStages}
          />
        </TabsContent>

        <TabsContent value="labor">
          <LaborCalculator 
            projectId="current-project"
            timeEntries={timeEntries}
          />
        </TabsContent>

        <TabsContent value="energy">
          <EnergyEstimator projectId="current-project" />
        </TabsContent>

        {/* Phase 2 Components */}
        <TabsContent value="transport">
          <TransportEmissions />
        </TabsContent>

        <TabsContent value="shipping">
          <ShippingTracker />
        </TabsContent>

        <TabsContent value="takeback">
          <TakebackSystem />
        </TabsContent>

        <TabsContent value="circular">
          <CircularDesign />
        </TabsContent>
      </Tabs>
    </div>
  );
}
