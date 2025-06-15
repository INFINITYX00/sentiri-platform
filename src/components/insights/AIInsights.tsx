
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  Target, 
  Leaf, 
  DollarSign,
  BarChart3,
  Sparkles
} from "lucide-react";

export function AIInsights() {
  const insights = [
    {
      type: "optimization",
      title: "Material Substitution Opportunity",
      description: "Replace virgin aluminum with recycled alternative to reduce carbon footprint by 35%",
      impact: "Save 12.4 kg CO₂ per project",
      savings: "$340 cost reduction",
      confidence: 94,
      icon: Leaf,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20"
    },
    {
      type: "trend",
      title: "Waste Reduction Trending Up",
      description: "Your waste reduction has improved 23% over the last 3 months",
      impact: "15.2 kg less waste per week",
      savings: "Continue current practices",
      confidence: 87,
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      type: "cost",
      title: "Bulk Purchase Recommendation",
      description: "Purchasing hemp fiber in larger quantities could reduce costs by 18%",
      impact: "Save $120 per month",
      savings: "ROI in 2.3 months",
      confidence: 91,
      icon: DollarSign,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20"
    },
    {
      type: "prediction",
      title: "Supply Chain Risk Alert",
      description: "Bamboo plywood supplier showing delivery delays. Consider alternative sources",
      impact: "Prevent 2-week delays",
      savings: "Maintain project timelines",
      confidence: 78,
      icon: Target,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    }
  ];

  const trends = [
    { metric: "Carbon Efficiency", current: 87, previous: 82, trend: "up" },
    { metric: "Cost Optimization", current: 73, previous: 71, trend: "up" },
    { metric: "Waste Reduction", current: 92, previous: 89, trend: "up" },
    { metric: "Supply Reliability", current: 68, previous: 74, trend: "down" }
  ];

  const achievements = [
    { title: "Carbon Neutral Goal", progress: 67, target: "Dec 2024" },
    { title: "Zero Waste Manufacturing", progress: 34, target: "Jun 2025" },
    { title: "100% Renewable Materials", progress: 82, target: "Mar 2024" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <div className="px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section - Now inside container */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Insights</h1>
              <p className="text-muted-foreground mt-1">Smart recommendations for sustainable manufacturing</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {trends.map((trend) => (
              <Card key={trend.metric} className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{trend.metric}</p>
                      <p className="text-2xl font-bold">{trend.current}%</p>
                      <div className="flex items-center space-x-1 mt-1">
                        {trend.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 text-green-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-400" />
                        )}
                        <span className={`text-xs ${trend.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                          {trend.trend === 'up' ? '+' : ''}{trend.current - trend.previous}%
                        </span>
                      </div>
                    </div>
                    <BarChart3 className="h-6 w-6 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Recommendations */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <span>Smart Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border ${insight.borderColor} ${insight.bgColor}`}>
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded ${insight.bgColor}`}>
                      <insight.icon className={`h-5 w-5 ${insight.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <Leaf className="h-4 w-4 text-primary" />
                          <span>{insight.impact}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-400" />
                          <span>{insight.savings}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">
                          Learn More
                        </Button>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          Apply Suggestion
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Progress Tracking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sustainability Goals */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Sustainability Goals</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{achievement.title}</span>
                      <span className="text-muted-foreground">
                        {achievement.progress}% • {achievement.target}
                      </span>
                    </div>
                    <Progress value={achievement.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Monthly Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-2xl font-bold text-primary">23%</p>
                    <p className="text-xs text-muted-foreground">Carbon Reduction</p>
                  </div>
                  <div className="text-center p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                    <p className="text-2xl font-bold text-green-400">$2.4k</p>
                    <p className="text-xs text-muted-foreground">Cost Savings</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">This Month vs Last Month</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Materials Used</span>
                      <span className="text-green-400">-8% ↓</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Energy Consumption</span>
                      <span className="text-green-400">-12% ↓</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Waste Generated</span>
                      <span className="text-green-400">-15% ↓</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recycling Rate</span>
                      <span className="text-primary">+5% ↑</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-center text-muted-foreground">
                    Keep up the excellent work! You're on track to exceed your sustainability targets.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
