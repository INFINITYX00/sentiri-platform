
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Truck, Factory, Recycle, Download, Leaf } from "lucide-react";
import { useMaterials } from "@/hooks/useMaterials";
import { useTransportRoutes } from "@/hooks/useTransportRoutes";
import { useProjects } from "@/hooks/useProjects";

export function DynamicCarbonJourney() {
  const { materials } = useMaterials();
  const { routes } = useTransportRoutes();
  const { projects } = useProjects();

  // Calculate real journey data
  const totalMaterialCarbon = materials.reduce((sum, m) => sum + (m.carbon_footprint || 0), 0);
  const totalTransportCarbon = routes.reduce((sum, r) => sum + r.carbon_impact, 0);
  const totalCarbon = totalMaterialCarbon + totalTransportCarbon;

  // Generate dynamic journey stages based on real data
  const journeyStages = [
    {
      stage: "Raw Material Extraction",
      location: materials.length > 0 ? `${materials.filter(m => m.origin).length} different origins` : "Various locations",
      carbon: totalMaterialCarbon * 0.4, // Assume 40% of material carbon from extraction
      description: `${materials.length} materials tracked from ${materials.filter(m => m.origin).map(m => m.origin).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'various sources'}`,
      icon: Factory,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    },
    {
      stage: "Processing & Manufacturing",
      location: "Production facilities",
      carbon: totalMaterialCarbon * 0.4, // Assume 40% from processing
      description: `Material processing for ${materials.filter(m => (m.quantity || 0) > 0).length} active materials`,
      icon: Factory,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      stage: "Transportation",
      location: routes.length > 0 ? `${routes.length} tracked routes` : "Local delivery",
      carbon: totalTransportCarbon,
      description: routes.length > 0 
        ? `${routes.length} transport routes, avg ${(routes.reduce((sum, r) => sum + r.distance, 0) / routes.length).toFixed(0)}km per route`
        : "No transport data tracked yet",
      icon: Truck,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      stage: "Manufacturing",
      location: "Workshop/Factory",
      carbon: totalMaterialCarbon * 0.2, // Assume 20% from final manufacturing
      description: `Production across ${projects.filter(p => p.status === 'in_progress').length} active projects`,
      icon: Factory,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20"
    },
    {
      stage: "End of Life",
      location: "Future recycling/disposal",
      carbon: -totalCarbon * 0.15, // Assume 15% carbon credit for recyclable materials
      description: `Estimated ${materials.filter(m => m.type?.includes('reclaimed') || m.type?.includes('recycled')).length}/${materials.length} materials recyclable`,
      icon: Recycle,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    }
  ];

  // Calculate alternative scenarios based on real data
  const recycledMaterialsCount = materials.filter(m => 
    m.type?.includes('reclaimed') || m.type?.includes('recycled') || m.type?.includes('bamboo')
  ).length;

  const alternativeScenarios = [
    {
      name: "Virgin Materials Only",
      carbon: totalCarbon * 1.8, // Assume 80% higher for virgin materials
      savings: -(totalCarbon * 0.8),
      color: "text-red-400"
    },
    {
      name: "50% More Local Sourcing",
      carbon: Math.max(totalCarbon * 0.85, totalCarbon - 5), // 15% reduction from local sourcing
      savings: totalCarbon * 0.15,
      color: "text-yellow-400"
    },
    {
      name: "100% Sustainable Materials",
      carbon: Math.max(totalCarbon * 0.6, totalCarbon - 15), // 40% reduction for full sustainability
      savings: totalCarbon * 0.4,
      color: "text-green-400"
    }
  ];

  const sustainabilityScore = recycledMaterialsCount > 0 ? (recycledMaterialsCount / materials.length) * 100 : 0;
  const carbonReduction = totalCarbon > 0 ? Math.min(60, sustainabilityScore + 10) : 0;

  return (
    <div className="space-y-6">
      {/* Journey Overview */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Carbon Journey Overview</span>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{totalCarbon.toFixed(1)} kg CO₂</p>
              <p className="text-sm text-muted-foreground">
                {materials.length} materials • {routes.length} transport routes
              </p>
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
                        {stage.carbon > 0 ? '+' : ''}{stage.carbon.toFixed(1)} kg CO₂
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
          <p className="text-sm text-muted-foreground">
            Based on your current {materials.length} materials and {routes.length} transport routes
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alternativeScenarios.map((scenario, index) => (
              <div key={index} className="p-4 bg-muted/20 rounded-lg border text-center">
                <h4 className="font-medium mb-2">{scenario.name}</h4>
                <p className="text-2xl font-bold mb-1">{scenario.carbon.toFixed(1)} kg CO₂</p>
                <p className={`text-sm ${scenario.color}`}>
                  {scenario.savings > 0 ? '-' : '+'}{Math.abs(scenario.savings).toFixed(1)} kg vs current
                </p>
              </div>
            ))}
          </div>
          
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              Current sustainability score: <span className="text-primary font-medium">{sustainabilityScore.toFixed(0)}%</span>
              {sustainabilityScore > 0 && (
                <span className="text-green-600 ml-2">
                  ({recycledMaterialsCount}/{materials.length} sustainable materials)
                </span>
              )}
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
            <p className="text-3xl font-bold text-green-400">{carbonReduction > 0 ? '-' : ''}{carbonReduction.toFixed(0)}%</p>
            <p className="text-muted-foreground">
              {carbonReduction > 0 
                ? "Carbon footprint reduction from sustainable choices"
                : "Baseline measurement - add sustainable materials to improve"
              }
            </p>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
              <div>
                <p className="text-lg font-bold text-blue-400">{materials.length}</p>
                <p className="text-xs text-muted-foreground">Materials tracked</p>
              </div>
              <div>
                <p className="text-lg font-bold text-purple-400">{routes.length}</p>
                <p className="text-xs text-muted-foreground">Transport routes</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-400">{recycledMaterialsCount}</p>
                <p className="text-xs text-muted-foreground">Sustainable materials</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
