import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, 
  Users, 
  Clock, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  TrendingUp
} from "lucide-react";

interface Worker {
  id: string;
  name: string;
  hourlyRate: number;
  specialty: string;
  availability: number; // hours per week
  hoursThisWeek: number;
}

interface ShiftPlan {
  date: string;
  worker: string;
  hours: number;
  stage: string;
  overtime: boolean;
}

interface LaborCalculatorProps {
  projectId: string;
  timeEntries: any[];
}

export function LaborCalculator({ projectId, timeEntries = [] }: LaborCalculatorProps) {
  const [workers] = useState<Worker[]>([
    {
      id: "1",
      name: "Sarah Chen",
      hourlyRate: 45,
      specialty: "Design & CAD",
      availability: 40,
      hoursThisWeek: 32
    },
    {
      id: "2", 
      name: "Mike Rodriguez",
      hourlyRate: 38,
      specialty: "Machining",
      availability: 40,
      hoursThisWeek: 28
    },
    {
      id: "3",
      name: "Anna Thompson", 
      hourlyRate: 42,
      specialty: "Assembly",
      availability: 35,
      hoursThisWeek: 24
    },
    {
      id: "4",
      name: "David Wilson",
      hourlyRate: 40,
      specialty: "Finishing", 
      availability: 40,
      hoursThisWeek: 35
    },
    {
      id: "5",
      name: "Emma Davis",
      hourlyRate: 43,
      specialty: "Quality Control",
      availability: 30,
      hoursThisWeek: 18
    }
  ]);

  const [plannedShifts] = useState<ShiftPlan[]>([
    { date: "2024-01-17", worker: "Mike Rodriguez", hours: 8, stage: "machining", overtime: false },
    { date: "2024-01-17", worker: "David Wilson", hours: 6, stage: "machining", overtime: false },
    { date: "2024-01-18", worker: "Anna Thompson", hours: 8, stage: "assembly", overtime: false },
    { date: "2024-01-18", worker: "Emma Davis", hours: 4, stage: "assembly", overtime: false },
    { date: "2024-01-19", worker: "Sarah Chen", hours: 6, stage: "finishing", overtime: false },
    { date: "2024-01-19", worker: "Emma Davis", hours: 8, stage: "finishing", overtime: false }
  ]);

  // Calculate costs from time entries - add safety check
  const totalLaborCost = Array.isArray(timeEntries) ? timeEntries.reduce((sum, entry) => sum + (entry.cost || 0), 0) : 0;
  const totalHours = Array.isArray(timeEntries) ? timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) : 0;
  const averageRate = totalHours > 0 ? totalLaborCost / totalHours : 0;

  // Calculate planned costs
  const plannedCost = plannedShifts.reduce((sum, shift) => {
    const worker = workers.find(w => w.name === shift.worker);
    const rate = worker ? worker.hourlyRate : 40;
    const overtimeMultiplier = shift.overtime ? 1.5 : 1;
    return sum + (shift.hours * rate * overtimeMultiplier);
  }, 0);

  const plannedHours = plannedShifts.reduce((sum, shift) => sum + shift.hours, 0);

  // Check for 8-hour rule compliance
  const getComplianceStatus = (worker: Worker) => {
    const dailyHours = plannedShifts
      .filter(shift => shift.worker === worker.name)
      .reduce((sum, shift) => Math.max(sum, shift.hours), 0);
    
    const weeklyHours = worker.hoursThisWeek + plannedShifts
      .filter(shift => shift.worker === worker.name)
      .reduce((sum, shift) => sum + shift.hours, 0);

    if (weeklyHours > worker.availability) return 'over-capacity';
    if (dailyHours > 8) return 'overtime';
    return 'compliant';
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-400';
      case 'overtime': return 'text-yellow-400';
      case 'over-capacity': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <Users className="h-4 w-4" />;
      case 'overtime': return <Clock className="h-4 w-4" />;
      case 'over-capacity': return <AlertTriangle className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cost Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actual Cost</p>
                <p className="text-2xl font-bold">${totalLaborCost.toFixed(0)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Planned Cost</p>
                <p className="text-2xl font-bold">${plannedCost.toFixed(0)}</p>
              </div>
              <Calculator className="h-6 w-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rate</p>
                <p className="text-2xl font-bold">${averageRate.toFixed(0)}/hr</p>
              </div>
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{(totalHours + plannedHours).toFixed(1)}</p>
              </div>
              <Clock className="h-6 w-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Worker Capacity & Compliance */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Worker Capacity & 8-Hour Rule Compliance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {workers.map((worker) => {
            const compliance = getComplianceStatus(worker);
            const utilization = (worker.hoursThisWeek / worker.availability) * 100;
            
            return (
              <div key={worker.id} className="p-4 bg-muted/20 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h4 className="font-medium">{worker.name}</h4>
                      <p className="text-sm text-muted-foreground">{worker.specialty} • ${worker.hourlyRate}/hr</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={`${getComplianceColor(compliance)} border-current`}
                    >
                      {getComplianceIcon(compliance)}
                      <span className="ml-1 capitalize">{compliance.replace('-', ' ')}</span>
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Weekly Capacity</span>
                    <span>{worker.hoursThisWeek}h / {worker.availability}h</span>
                  </div>
                  <Progress value={utilization} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>Available: {worker.availability - worker.hoursThisWeek}h</div>
                    <div>Utilization: {utilization.toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Shift Planning */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Upcoming Shift Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {plannedShifts.map((shift, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium">
                    {new Date(shift.date).toLocaleDateString()}
                  </div>
                  <div>
                    <p className="font-medium">{shift.worker}</p>
                    <p className="text-sm text-muted-foreground capitalize">{shift.stage}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{shift.hours}h</p>
                  {shift.overtime && (
                    <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400">
                      Overtime
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Total Planned</span>
              <span className="font-medium">{plannedHours}h • ${plannedCost.toFixed(0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
