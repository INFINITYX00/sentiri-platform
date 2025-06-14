
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, Leaf, Zap, CheckCircle2, Circle } from "lucide-react";
import { useDesignSuggestions } from "@/hooks/useDesignSuggestions";

export function CircularDesign() {
  const { suggestions, loading, applySuggestion, generateSuggestions } = useDesignSuggestions();

  const handleApplySuggestion = async (id: string) => {
    await applySuggestion(id);
  };

  const handleGenerateNew = async () => {
    await generateSuggestions();
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Material Optimization': return <Leaf className="h-4 w-4" />;
      case 'Design Efficiency': return <Zap className="h-4 w-4" />;
      case 'Manufacturing Process': return <TrendingUp className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const appliedCount = suggestions.filter(s => s.applied).length;
  const totalCarbonReduction = suggestions.filter(s => s.applied).reduce((sum, s) => sum + s.carbon_reduction, 0);
  const pendingCount = suggestions.filter(s => !s.applied).length;

  if (loading) {
    return <div>Loading design suggestions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Suggestions</p>
                <p className="text-2xl font-bold">{suggestions.length}</p>
              </div>
              <Lightbulb className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applied</p>
                <p className="text-2xl font-bold">{appliedCount}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <Circle className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Carbon Saved</p>
                <p className="text-2xl font-bold">{totalCarbonReduction.toFixed(1)} kg</p>
              </div>
              <div className="text-primary">CO₂</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Generation */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>AI Design Optimization</span>
            </div>
            <Button onClick={handleGenerateNew} className="bg-primary hover:bg-primary/90">
              Generate New Suggestions
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Our AI analyzes your current design and materials to suggest optimizations for sustainability, 
            cost reduction, and carbon footprint minimization.
          </p>
        </CardContent>
      </Card>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className={`sentiri-card ${suggestion.applied ? 'border-green-200 bg-green-50/30' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(suggestion.category)}
                  <Badge variant="outline" className="text-xs">
                    {suggestion.category}
                  </Badge>
                </div>
                {suggestion.applied && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </div>
              <CardTitle className="text-lg">{suggestion.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {suggestion.description}
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={getImpactColor(suggestion.impact)}>
                  Impact: {suggestion.impact}
                </Badge>
                <Badge variant="outline" className={getEffortColor(suggestion.implementation_effort)}>
                  Effort: {suggestion.implementation_effort}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm">
                {suggestion.materials_saved && (
                  <div>
                    <span className="font-medium">Materials Saved: </span>
                    <span className="text-muted-foreground">{suggestion.materials_saved}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium">Carbon Reduction: </span>
                  <span className="text-primary">{suggestion.carbon_reduction} kg CO₂e</span>
                </div>
              </div>

              {!suggestion.applied && (
                <Button 
                  onClick={() => handleApplySuggestion(suggestion.id)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Apply Suggestion
                </Button>
              )}
              
              {suggestion.applied && (
                <div className="flex items-center justify-center space-x-2 text-green-600 py-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Applied Successfully</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {suggestions.length === 0 && (
        <Card className="sentiri-card">
          <CardContent className="p-8 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Suggestions Yet</h3>
            <p className="text-muted-foreground mb-4">
              Click "Generate New Suggestions" to get AI-powered design optimizations.
            </p>
            <Button onClick={handleGenerateNew} className="bg-primary hover:bg-primary/90">
              Generate Suggestions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
