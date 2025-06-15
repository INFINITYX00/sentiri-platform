
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Leaf, TrendingDown, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { useMaterials } from "@/hooks/useMaterials";
import { useProjects } from "@/hooks/useProjects";
import { useClaudeAnalytics } from "@/hooks/useClaudeAnalytics";
import { Button } from "@/components/ui/button";

export function CarbonCalculator() {
  const { materials } = useMaterials();
  const { projects } = useProjects();
  const { 
    insights, 
    materialRecommendations,
    loading: insightsLoading, 
    generateCarbonInsights,
    generateMaterialOptimization 
  } = useClaudeAnalytics();

  // Calculate real metrics from actual data
  const totalCarbon = materials.reduce((sum, material) => sum + (material.carbon_footprint || 0), 0);
  const activeMaterials = materials.filter(m => (m.quantity || 0) > 0);
  
  // Calculate dynamic carbon budget based on active projects
  const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'planning');
  const carbonBudget = activeProjects.length > 0 
    ? activeProjects.reduce((sum, p) => sum + (p.total_carbon_footprint || 50), 0) 
    : Math.max(totalCarbon * 1.2, 35); // 20% buffer or minimum 35kg
    
  const carbonEfficiency = carbonBudget > 0 ? Math.max(0, ((carbonBudget - totalCarbon) / carbonBudget) * 100) : 0;

  const getSustainabilityIcon = (material: any) => {
    const carbonPerKg = material.weight > 0 ? (material.carbon_footprint || 0) / material.weight : (material.carbon_footprint || 0);
    
    if (material.type?.includes('reclaimed') || material.type?.includes('recycled')) {
      return <Leaf className="h-4 w-4 text-primary" />;
    } else if (carbonPerKg < 2) {
      return <TrendingDown className="h-4 w-4 text-green-400" />;
    } else if (carbonPerKg < 5) {
      return <TrendingUp className="h-4 w-4 text-yellow-400" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-red-400" />;
    }
  };

  const getSustainabilityScore = (material: any) => {
    const carbonPerKg = material.weight > 0 ? (material.carbon_footprint || 0) / material.weight : (material.carbon_footprint || 0);
    
    if (material.type?.includes('reclaimed') || material.type?.includes('recycled')) {
      return 'Outstanding';
    } else if (carbonPerKg < 2) {
      return 'Excellent';
    } else if (carbonPerKg < 5) {
      return 'Good';
    } else {
      return 'Needs Improvement';
    }
  };

  const getSustainabilityColor = (score: string) => {
    switch (score) {
      case 'Outstanding': return 'text-primary';
      case 'Excellent': return 'text-green-400';
      case 'Good': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  const handleGenerateInsights = async () => {
    await generateCarbonInsights();
    await generateMaterialOptimization();
  };

  return (
    <div className="space-y-6">
      {/* Carbon Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Embodied Carbon</p>
              <p className="text-3xl font-bold text-primary">{totalCarbon.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">kg CO₂</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Carbon Budget</p>
              <p className="text-3xl font-bold">{carbonBudget.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">kg CO₂ allocated</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Efficiency</p>
              <p className="text-3xl font-bold text-green-400">{carbonEfficiency.toFixed(0)}%</p>
              <p className="text-sm text-muted-foreground">
                {carbonEfficiency > 0 ? 'under budget' : 'over budget'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carbon Budget Progress */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span>Carbon Budget Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used: {totalCarbon.toFixed(1)} kg CO₂</span>
              <span>Budget: {carbonBudget.toFixed(1)} kg CO₂</span>
            </div>
            <Progress value={Math.min(100, (totalCarbon / carbonBudget) * 100)} className="h-3" />
          </div>
          <div className="flex items-center space-x-2">
            {carbonEfficiency > 0 ? (
              <>
                <TrendingDown className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">
                  {(carbonBudget - totalCarbon).toFixed(1)} kg CO₂ remaining in budget
                </span>
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-400">
                  {(totalCarbon - carbonBudget).toFixed(1)} kg CO₂ over budget
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Material Breakdown */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle>Material Carbon Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">
            {activeMaterials.length} active materials tracked
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeMaterials.length > 0 ? (
            activeMaterials
              .sort((a, b) => (b.carbon_footprint || 0) - (a.carbon_footprint || 0))
              .slice(0, 8) // Show top 8 materials
              .map((material, index) => {
                const sustainability = getSustainabilityScore(material);
                const carbonPerUnit = material.quantity > 0 ? (material.carbon_footprint || 0) / material.quantity : 0;
                
                return (
                  <div key={material.id} className="p-4 bg-muted/20 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getSustainabilityIcon(material)}
                        <div>
                          <h4 className="font-medium">{material.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {material.quantity} {material.unit} • {material.type}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${getSustainabilityColor(sustainability).replace('text-', 'border-')}`}>
                        {sustainability}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Per Unit:</span>
                        <p className="font-medium">{carbonPerUnit.toFixed(2)} kg CO₂</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <p className="font-medium text-primary">{(material.carbon_footprint || 0).toFixed(1)} kg CO₂</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">% of Total:</span>
                        <p className="font-medium">
                          {totalCarbon > 0 ? (((material.carbon_footprint || 0) / totalCarbon) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Progress 
                        value={totalCarbon > 0 ? ((material.carbon_footprint || 0) / totalCarbon) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No materials with carbon data found</p>
              <p className="text-sm text-muted-foreground mt-1">Add materials to see carbon breakdown</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Carbon Optimization */}
      <Card className="sentiri-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span>AI Carbon Optimization</span>
            </div>
            <Button onClick={handleGenerateInsights} disabled={insightsLoading} size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              {insightsLoading ? "Analyzing..." : "Refresh Analysis"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {materialRecommendations.length > 0 ? (
            materialRecommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="font-medium text-primary">{rec.current_material} Optimization</p>
                <p className="text-sm text-muted-foreground mt-1">{rec.suggestion}</p>
                <div className="flex gap-4 text-sm mt-2">
                  <span className="text-green-600">{rec.carbon_reduction}</span>
                  <span className="text-blue-600">{rec.cost_impact}</span>
                </div>
              </div>
            ))
          ) : insights.length > 0 ? (
            insights.slice(0, 3).map((insight, index) => (
              <div key={index} className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="font-medium text-primary">{insight.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                <div className="flex gap-4 text-sm mt-2">
                  <span className="text-green-600">{insight.impact}</span>
                  <span className="text-blue-600">{insight.savings}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Click "Refresh Analysis" to get AI-powered optimization suggestions based on your materials
              </p>
            </div>
          )}
          
          {(materialRecommendations.length > 0 || insights.length > 0) && (
            <div className="pt-3 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Based on analysis of {materials.length} materials and {projects.length} projects
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
