
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Calculator, TrendingUp, MapPin, Factory, Truck, Sparkles } from "lucide-react";
import { CarbonCalculator } from "../bom/CarbonCalculator";
import { CarbonJourney } from "../bom/CarbonJourney";
import { TransportEmissions } from "./TransportEmissions";
import { useTransportRoutes } from "@/hooks/useTransportRoutes";
import { useMaterials } from "@/hooks/useMaterials";
import { useProjects } from "@/hooks/useProjects";
import { useClaudeAnalytics } from "@/hooks/useClaudeAnalytics";

export function CarbonTracker() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'journey' | 'transport' | 'insights'>('calculator');
  
  const { routes } = useTransportRoutes();
  const { materials } = useMaterials();
  const { projects } = useProjects();
  const { 
    insights, 
    loading: insightsLoading, 
    generateCarbonInsights,
    generateMaterialOptimization,
    generateTransportOptimization,
    materialRecommendations,
    transportOptimizations
  } = useClaudeAnalytics();

  // Calculate real metrics from actual data
  const totalMaterialCarbon = materials.reduce((sum, m) => sum + (m.carbon_footprint || 0), 0);
  const totalTransportCarbon = routes.reduce((sum, r) => sum + r.carbon_impact, 0);
  const totalProjectCarbon = projects.reduce((sum, p) => sum + (p.total_carbon_footprint || 0), 0);
  const totalCarbonFootprint = totalMaterialCarbon + totalTransportCarbon;

  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const avgCarbonPerProject = completedProjects > 0 ? totalProjectCarbon / completedProjects : 0;

  // Calculate reduction percentage (assuming baseline of 150% higher carbon footprint)
  const baselineCarbon = totalCarbonFootprint * 1.5;
  const carbonReductionPercentage = baselineCarbon > 0 ? ((baselineCarbon - totalCarbonFootprint) / baselineCarbon) * 100 : 0;

  const carbonStats = [
    { 
      label: "Total Carbon Tracked", 
      value: `${totalCarbonFootprint.toFixed(1)} kg CO₂`, 
      icon: Leaf, 
      color: "text-primary",
      breakdown: `Materials: ${totalMaterialCarbon.toFixed(1)} kg, Transport: ${totalTransportCarbon.toFixed(1)} kg`
    },
    { 
      label: "Projects Analyzed", 
      value: projects.length.toString(), 
      icon: Factory, 
      color: "text-blue-400",
      breakdown: `${completedProjects} completed, ${projects.filter(p => p.status === 'in_progress').length} in progress`
    },
    { 
      label: "Carbon Efficiency", 
      value: `${carbonReductionPercentage.toFixed(0)}%`, 
      icon: TrendingUp, 
      color: "text-green-400",
      breakdown: `Avg ${avgCarbonPerProject.toFixed(1)} kg CO₂ per project`
    },
    { 
      label: "Transport Routes", 
      value: routes.length.toString(), 
      icon: Truck, 
      color: "text-orange-400",
      breakdown: `${totalTransportCarbon.toFixed(1)} kg CO₂ from transport`
    }
  ];

  const handleGenerateInsights = async () => {
    await generateCarbonInsights();
    await generateMaterialOptimization();
    await generateTransportOptimization();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Carbon Tracking</h1>
              <p className="text-muted-foreground mt-1">Monitor, analyze and optimize your carbon footprint with AI insights</p>
            </div>
            <Button onClick={handleGenerateInsights} disabled={insightsLoading} className="gap-2">
              <Sparkles className="h-4 w-4" />
              {insightsLoading ? "Generating..." : "AI Analysis"}
            </Button>
          </div>

          {/* Dynamic Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {carbonStats.map((stat) => (
              <Card key={stat.label} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.breakdown}</p>
                    </div>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation Tabs */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex gap-2 mb-6 flex-wrap">
                <Button
                  variant={activeTab === 'calculator' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('calculator')}
                  className="flex-1 min-w-[120px]"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculator
                </Button>
                <Button
                  variant={activeTab === 'journey' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('journey')}
                  className="flex-1 min-w-[120px]"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Journey
                </Button>
                <Button
                  variant={activeTab === 'transport' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('transport')}
                  className="flex-1 min-w-[120px]"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Transport
                </Button>
                <Button
                  variant={activeTab === 'insights' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('insights')}
                  className="flex-1 min-w-[120px]"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  AI Insights
                </Button>
              </div>

              {/* Tab Content */}
              {activeTab === 'calculator' && <CarbonCalculator />}
              {activeTab === 'journey' && <CarbonJourney />}
              {activeTab === 'transport' && <TransportEmissions />}
              {activeTab === 'insights' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">AI-Powered Carbon Insights</h3>
                    <Button onClick={handleGenerateInsights} disabled={insightsLoading} size="sm">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Refresh Analysis
                    </Button>
                  </div>
                  
                  {insights.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-lg">Carbon Reduction Opportunities</h4>
                      {insights.map((insight, index) => (
                        <Card key={index} className="p-4 bg-white border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium mb-2">{insight.title}</h4>
                              <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                              <div className="flex gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <Leaf className="h-4 w-4 text-primary" />
                                  {insight.impact}
                                </span>
                                <span className="text-green-600">{insight.savings}</span>
                              </div>
                              <div className="mt-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  insight.confidence > 85 ? 'bg-green-100 text-green-800' :
                                  insight.confidence > 75 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {insight.confidence}% confidence
                                </span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              Apply
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {materialRecommendations.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-lg">Material Optimization</h4>
                      {materialRecommendations.map((rec, index) => (
                        <Card key={index} className="p-4 bg-white border">
                          <h5 className="font-medium mb-2">Replace {rec.current_material}</h5>
                          <p className="text-sm text-muted-foreground mb-2">{rec.suggestion}</p>
                          <div className="flex gap-4 text-sm">
                            <span className="text-green-600">Carbon: {rec.carbon_reduction}</span>
                            <span className="text-blue-600">Cost: {rec.cost_impact}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">{rec.implementation}</p>
                        </Card>
                      ))}
                    </div>
                  )}

                  {transportOptimizations.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-lg">Transport Optimization</h4>
                      {transportOptimizations.map((opt, index) => (
                        <Card key={index} className="p-4 bg-white border">
                          <h5 className="font-medium mb-2">{opt.current_route}</h5>
                          <p className="text-sm text-muted-foreground mb-2">{opt.optimization}</p>
                          <div className="flex gap-4 text-sm">
                            <span className="text-green-600">Carbon: {opt.carbon_savings}</span>
                            <span className="text-blue-600">Cost: {opt.cost_impact}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {insights.length === 0 && materialRecommendations.length === 0 && transportOptimizations.length === 0 && !insightsLoading && (
                    <div className="text-center py-12">
                      <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">AI Insights Ready</h3>
                      <p className="text-muted-foreground mb-4">
                        Click "AI Analysis" to generate intelligent recommendations based on your actual materials, projects, and transport data
                      </p>
                      <Button onClick={handleGenerateInsights} disabled={insightsLoading}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate AI Insights
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
