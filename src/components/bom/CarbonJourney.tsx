
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Truck, Factory, Recycle, Download } from "lucide-react";

export function CarbonJourney() {
  const journeyStages = [
    {
      stage: "Raw Material Extraction",
      location: "Sustainable Forest, Oregon",
      carbon: 8.2,
      description: "Reclaimed wood from demolished Victorian building",
      icon: Factory,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    },
    {
      stage: "Processing & Manufacturing",
      location: "Local Sawmill, Portland",
      carbon: 3.1,
      description: "Solar-powered milling and finishing processes",
      icon: Factory,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      stage: "Transportation",
      location: "Portland to Workshop",
      carbon: 2.3,
      description: "Electric delivery truck, 45km journey",
      icon: Truck,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      stage: "Manufacturing",
      location: "Sentiri Workshop",
      carbon: 12.8,
      description: "CNC machining, assembly, finishing",
      icon: Factory,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20"
    },
    {
      stage: "End of Life",
      location: "Future Recycling",
      carbon: -4.2,
      description: "Material can be fully recycled or composted",
      icon: Recycle,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    }
  ];

  const totalCarbon = journeyStages.reduce((sum, stage) => sum + stage.carbon, 0);

  const alternativeScenarios = [
    {
      name: "Virgin Timber Scenario",
      carbon: 45.2,
      savings: -23.1,
      color: "text-red-400"
    },
    {
      name: "Local Recycled Materials",
      carbon: 18.3,
      savings: 3.8,
      color: "text-yellow-400"
    },
    {
      name: "Optimal Green Choice",
      carbon: 15.2,
      savings: 6.9,
      color: "text-green-400"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Journey Overview */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Carbon Journey Overview</span>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{totalCarbon.toFixed(1)} kg CO₂</p>
              <p className="text-sm text-muted-foreground">Total Footprint</p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Journey Timeline */}
      <div className="space-y-4">
        {journeyStages.map((stage, index) => (
          <div key={index} className="relative">
            <Card className={`sentiri-card ${stage.borderColor}`}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${stage.bgColor} border ${stage.borderColor}`}>
                    <stage.icon className={`h-6 w-6 ${stage.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{stage.stage}</h3>
                      <Badge 
                        variant="outline" 
                        className={`${stage.carbon < 0 ? 'border-green-500/30 text-green-400' : 'border-primary/30 text-primary'}`}
                      >
                        {stage.carbon > 0 ? '+' : ''}{stage.carbon} kg CO₂
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{stage.location}</span>
                    </div>
                    
                    <p className="text-sm">{stage.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Arrow connector */}
            {index < journeyStages.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Alternative Scenarios */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle>Alternative Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alternativeScenarios.map((scenario, index) => (
              <div key={index} className="p-4 bg-muted/20 rounded-lg border text-center">
                <h4 className="font-medium mb-2">{scenario.name}</h4>
                <p className="text-2xl font-bold mb-1">{scenario.carbon} kg CO₂</p>
                <p className={`text-sm ${scenario.color}`}>
                  {scenario.savings > 0 ? '-' : '+'}{Math.abs(scenario.savings)} kg vs current
                </p>
              </div>
            ))}
          </div>
          
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              Your current choice saves <span className="text-primary font-medium">23.1 kg CO₂</span> compared to virgin materials
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Journey
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Share Results
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Summary */}
      <Card className="sentiri-card border-primary/20">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-primary">Environmental Impact</h3>
            <p className="text-3xl font-bold text-green-400">-51%</p>
            <p className="text-muted-foreground">
              Carbon footprint reduction compared to conventional manufacturing
            </p>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
              <div>
                <p className="text-lg font-bold text-blue-400">156</p>
                <p className="text-xs text-muted-foreground">Trees equivalent saved</p>
              </div>
              <div>
                <p className="text-lg font-bold text-purple-400">2.1</p>
                <p className="text-xs text-muted-foreground">Months of car driving offset</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-400">89%</p>
                <p className="text-xs text-muted-foreground">Materials recyclable</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
