
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Calculator, TrendingUp, MapPin, Factory } from "lucide-react";
import { CarbonCalculator } from "../bom/CarbonCalculator";
import { CarbonJourney } from "../bom/CarbonJourney";

export function CarbonTracker() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'journey' | 'insights'>('calculator');

  const carbonStats = [
    { label: "Total Carbon Saved", value: "342.7 kg CO₂", icon: Leaf, color: "text-green-400" },
    { label: "Projects Analyzed", value: "23", icon: Factory, color: "text-blue-400" },
    { label: "Avg Reduction", value: "34%", icon: TrendingUp, color: "text-primary" },
    { label: "Sustainability Score", value: "87/100", icon: Calculator, color: "text-purple-400" }
  ];

  const insights = [
    {
      title: "Material Optimization",
      description: "Switch to reclaimed wood could save 15.2 kg CO₂ per project",
      impact: "High",
      effort: "Medium"
    },
    {
      title: "Local Sourcing",
      description: "Sourcing materials within 50km reduces transport emissions by 40%",
      impact: "Medium",
      effort: "Low"
    },
    {
      title: "Energy Efficiency",
      description: "Solar-powered tools could reduce manufacturing emissions by 25%",
      impact: "High",
      effort: "High"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Carbon Tracking</h1>
            <p className="text-muted-foreground mt-1">Monitor, analyze and optimize your carbon footprint</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-8 py-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {carbonStats.map((stat) => (
              <Card key={stat.label} className="bg-white">
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
                  variant={activeTab === 'insights' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('insights')}
                  className="flex-1 min-w-[120px]"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Insights
                </Button>
              </div>

              {/* Tab Content */}
              {activeTab === 'calculator' && <CarbonCalculator />}
              {activeTab === 'journey' && <CarbonJourney />}
              {activeTab === 'insights' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Carbon Reduction Insights</h3>
                  {insights.map((insight, index) => (
                    <Card key={index} className="p-4 bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                          <div className="flex gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              insight.impact === 'High' ? 'bg-green-100 text-green-800' :
                              insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {insight.impact} Impact
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              insight.effort === 'Low' ? 'bg-green-100 text-green-800' :
                              insight.effort === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {insight.effort} Effort
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
