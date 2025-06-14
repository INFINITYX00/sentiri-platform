
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Leaf, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

export function CarbonCalculator() {
  const carbonData = [
    {
      material: "Reclaimed Oak",
      quantity: 8,
      unit: "boards",
      carbonPerUnit: 2.1,
      totalCarbon: 16.8,
      category: "Wood",
      sustainability: "Excellent",
      color: "text-green-400"
    },
    {
      material: "Bamboo Plywood",
      quantity: 6,
      unit: "sheets",
      carbonPerUnit: 1.2,
      totalCarbon: 7.2,
      category: "Wood",
      sustainability: "Excellent",
      color: "text-green-400"
    },
    {
      material: "Hemp Fiber",
      quantity: 2,
      unit: "rolls",
      carbonPerUnit: 0.8,
      totalCarbon: 1.6,
      category: "Bio-material",
      sustainability: "Outstanding",
      color: "text-primary"
    },
    {
      material: "Bio-resin",
      quantity: 1.5,
      unit: "L",
      carbonPerUnit: 3.2,
      totalCarbon: 4.8,
      category: "Chemical",
      sustainability: "Good",
      color: "text-yellow-400"
    }
  ];

  const totalCarbon = carbonData.reduce((sum, item) => sum + item.totalCarbon, 0);
  const carbonBudget = 35.0; // kg CO₂
  const carbonEfficiency = ((carbonBudget - totalCarbon) / carbonBudget) * 100;

  const getSustainabilityIcon = (sustainability: string) => {
    switch (sustainability) {
      case 'Outstanding': return <Leaf className="h-4 w-4 text-primary" />;
      case 'Excellent': return <TrendingDown className="h-4 w-4 text-green-400" />;
      case 'Good': return <TrendingUp className="h-4 w-4 text-yellow-400" />;
      default: return <AlertTriangle className="h-4 w-4 text-red-400" />;
    }
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
              <p className="text-3xl font-bold">{carbonBudget}</p>
              <p className="text-sm text-muted-foreground">kg CO₂ allocated</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Efficiency</p>
              <p className="text-3xl font-bold text-green-400">{carbonEfficiency.toFixed(0)}%</p>
              <p className="text-sm text-muted-foreground">under budget</p>
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
              <span>Budget: {carbonBudget} kg CO₂</span>
            </div>
            <Progress value={(totalCarbon / carbonBudget) * 100} className="h-3" />
          </div>
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-400">
              {(carbonBudget - totalCarbon).toFixed(1)} kg CO₂ remaining in budget
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Material Breakdown */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle>Material Carbon Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {carbonData.map((item, index) => (
            <div key={index} className="p-4 bg-muted/20 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getSustainabilityIcon(item.sustainability)}
                  <div>
                    <h4 className="font-medium">{item.material}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} {item.unit} • {item.category}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={`${item.color.replace('text-', 'border-')}`}>
                  {item.sustainability}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Per Unit:</span>
                  <p className="font-medium">{item.carbonPerUnit} kg CO₂</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <p className="font-medium text-primary">{item.totalCarbon} kg CO₂</p>
                </div>
                <div>
                  <span className="text-muted-foreground">% of Total:</span>
                  <p className="font-medium">{((item.totalCarbon / totalCarbon) * 100).toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="mt-2">
                <Progress 
                  value={(item.totalCarbon / totalCarbon) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="sentiri-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <Leaf className="h-5 w-5" />
            <span>AI Carbon Optimization</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Optimization Opportunity</p>
            <p className="text-sm text-muted-foreground mt-1">
              Replace 2L of bio-resin with hemp-based alternative to reduce carbon footprint by 3.2 kg CO₂ (10.6% reduction)
            </p>
          </div>
          
          <div className="p-3 bg-green-500/5 rounded-lg border border-green-500/20">
            <p className="font-medium text-green-400">Excellent Choice</p>
            <p className="text-sm text-muted-foreground mt-1">
              Using reclaimed oak saves 12.3 kg CO₂ compared to virgin timber
            </p>
          </div>
          
          <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
            <p className="font-medium text-blue-400">Local Sourcing Benefit</p>
            <p className="text-sm text-muted-foreground mt-1">
              All materials sourced within 50km radius reduces transport emissions by 2.1 kg CO₂
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
