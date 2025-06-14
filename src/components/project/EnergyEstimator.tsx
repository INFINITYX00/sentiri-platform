
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  Gauge, 
  TrendingUp, 
  Leaf, 
  Settings,
  BarChart3
} from "lucide-react";

interface EquipmentUsage {
  id: string;
  name: string;
  type: string;
  powerRating: number; // kW
  hoursUsed: number;
  energyConsumed: number; // kWh
  efficiency: number; // percentage
  carbonFactor: number; // kg CO2 per kWh
}

interface EnergyEstimatorProps {
  projectId: string;
}

export function EnergyEstimator({ projectId }: EnergyEstimatorProps) {
  const [equipmentUsage] = useState<EquipmentUsage[]>([
    {
      id: "1",
      name: "Table Saw",
      type: "Cutting",
      powerRating: 3.5,
      hoursUsed: 4.2,
      energyConsumed: 14.7,
      efficiency: 85,
      carbonFactor: 0.233
    },
    {
      id: "2",
      name: "Planer",
      type: "Finishing",
      powerRating: 2.8,
      hoursUsed: 2.5,
      energyConsumed: 7.0,
      efficiency: 82,
      carbonFactor: 0.233
    },
    {
      id: "3",
      name: "Dust Collection",
      type: "Support",
      powerRating: 1.5,
      hoursUsed: 6.7,
      energyConsumed: 10.05,
      efficiency: 75,
      carbonFactor: 0.233
    },
    {
      id: "4",
      name: "Sanders",
      type: "Finishing",
      powerRating: 0.8,
      hoursUsed: 3.0,
      energyConsumed: 2.4,
      efficiency: 70,
      carbonFactor: 0.233
    },
    {
      id: "5",
      name: "LED Lighting",
      type: "Facility",
      powerRating: 0.2,
      hoursUsed: 15.0,
      energyConsumed: 3.0,
      efficiency: 90,
      carbonFactor: 0.233
    }
  ]);

  const [energyTargets] = useState({
    dailyTarget: 25, // kWh
    weeklyTarget: 125, // kWh
    carbonTarget: 30, // kg CO2
    efficiencyTarget: 80 // percentage
  });

  const totalEnergyConsumed = equipmentUsage.reduce((sum, equipment) => sum + equipment.energyConsumed, 0);
  const totalCarbonEmissions = equipmentUsage.reduce((sum, equipment) => 
    sum + (equipment.energyConsumed * equipment.carbonFactor), 0);
  const averageEfficiency = equipmentUsage.reduce((sum, equipment) => sum + equipment.efficiency, 0) / equipmentUsage.length;
  
  const energyEfficiencyRatio = (averageEfficiency / 100) * 100;
  const carbonPerformance = ((energyTargets.carbonTarget - totalCarbonEmissions) / energyTargets.carbonTarget) * 100;

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 85) return 'text-green-400';
    if (efficiency >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 85) return 'Excellent';
    if (efficiency >= 75) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      {/* Energy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Energy</p>
                <p className="text-2xl font-bold">{totalEnergyConsumed.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">kWh</p>
              </div>
              <Zap className="h-6 w-6 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Carbon Impact</p>
                <p className="text-2xl font-bold">{totalCarbonEmissions.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">kg CO₂</p>
              </div>
              <Leaf className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Efficiency</p>
                <p className="text-2xl font-bold">{averageEfficiency.toFixed(0)}%</p>
              </div>
              <Gauge className="h-6 w-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cost Estimate</p>
                <p className="text-2xl font-bold">${(totalEnergyConsumed * 0.12).toFixed(0)}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Energy Performance Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="sentiri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Energy Targets</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Daily Energy Usage</span>
                  <span>{totalEnergyConsumed.toFixed(1)} / {energyTargets.dailyTarget} kWh</span>
                </div>
                <Progress value={(totalEnergyConsumed / energyTargets.dailyTarget) * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Carbon Efficiency</span>
                  <span className={carbonPerformance > 0 ? 'text-green-400' : 'text-red-400'}>
                    {carbonPerformance > 0 ? '+' : ''}{carbonPerformance.toFixed(1)}%
                  </span>
                </div>
                <Progress value={Math.max(0, carbonPerformance)} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Equipment Efficiency</span>
                  <span>{averageEfficiency.toFixed(0)} / {energyTargets.efficiencyTarget}%</span>
                </div>
                <Progress value={(averageEfficiency / energyTargets.efficiencyTarget) * 100} className="h-2" />
              </div>
            </div>
            
            <div className="pt-3 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-primary/5 rounded border border-primary/20">
                  <p className="font-medium text-primary">{(totalEnergyConsumed * 0.12).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Energy Cost ($)</p>
                </div>
                <div className="text-center p-2 bg-green-500/5 rounded border border-green-500/20">
                  <p className="font-medium text-green-400">{totalCarbonEmissions.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">CO₂ Emissions (kg)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="sentiri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>Equipment Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {equipmentUsage.map((equipment) => (
              <div key={equipment.id} className="p-3 bg-muted/20 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{equipment.name}</h4>
                    <p className="text-sm text-muted-foreground">{equipment.type} • {equipment.powerRating}kW</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getEfficiencyColor(equipment.efficiency)} border-current`}
                  >
                    {getEfficiencyBadge(equipment.efficiency)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="block">Hours</span>
                    <span className="font-medium text-foreground">{equipment.hoursUsed}h</span>
                  </div>
                  <div>
                    <span className="block">Energy</span>
                    <span className="font-medium text-foreground">{equipment.energyConsumed}kWh</span>
                  </div>
                  <div>
                    <span className="block">Efficiency</span>
                    <span className={`font-medium ${getEfficiencyColor(equipment.efficiency)}`}>
                      {equipment.efficiency}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="sentiri-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <Leaf className="h-5 w-5" />
            <span>Energy Optimization Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Peak Efficiency Window</p>
            <p className="text-sm text-muted-foreground mt-1">
              Running the table saw between 9-11 AM when grid carbon intensity is lowest could reduce emissions by 15%
            </p>
          </div>
          
          <div className="p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
            <p className="font-medium text-yellow-400">Equipment Maintenance Alert</p>
            <p className="text-sm text-muted-foreground mt-1">
              Dust collection system efficiency has dropped to 75%. Service recommended to improve energy efficiency.
            </p>
          </div>
          
          <div className="p-3 bg-green-500/5 rounded-lg border border-green-500/20">
            <p className="font-medium text-green-400">Renewable Energy Opportunity</p>
            <p className="text-sm text-muted-foreground mt-1">
              Current energy usage pattern is ideal for solar panel installation. Estimated 60% renewable coverage possible.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
