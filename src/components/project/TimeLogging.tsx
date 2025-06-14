
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Square, Users, Calculator } from "lucide-react";

interface TimeEntry {
  id: string;
  stage: string;
  task: string;
  duration: number;
  worker: string;
  hourlyRate: number;
  cost: number;
  timestamp: string;
}

interface TimeLoggingProps {
  projectId: string;
  onTimeUpdate: (entries: TimeEntry[]) => void;
}

export function TimeLogging({ projectId, onTimeUpdate }: TimeLoggingProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      id: "1",
      stage: "design",
      task: "CAD modeling",
      duration: 4.5,
      worker: "Sarah Chen",
      hourlyRate: 45,
      cost: 202.5,
      timestamp: "2024-01-15T09:00:00Z"
    },
    {
      id: "2",
      stage: "machining",
      task: "Cutting reclaimed wood",
      duration: 6.0,
      worker: "Mike Rodriguez",
      hourlyRate: 38,
      cost: 228,
      timestamp: "2024-01-16T08:30:00Z"
    },
    {
      id: "3",
      stage: "assembly",
      task: "Table assembly",
      duration: 3.5,
      worker: "Anna Thompson",
      hourlyRate: 42,
      cost: 147,
      timestamp: "2024-01-16T14:00:00Z"
    }
  ]);

  const [newEntry, setNewEntry] = useState({
    stage: "",
    task: "",
    duration: "",
    worker: "",
    hourlyRate: "40"
  });

  const stages = [
    { value: "design", label: "Design", color: "bg-blue-500" },
    { value: "machining", label: "Machining", color: "bg-orange-500" },
    { value: "assembly", label: "Assembly", color: "bg-green-500" },
    { value: "finishing", label: "Finishing", color: "bg-purple-500" }
  ];

  const workers = [
    "Sarah Chen", "Mike Rodriguez", "Anna Thompson", "David Wilson", "Emma Davis"
  ];

  const addTimeEntry = () => {
    if (!newEntry.stage || !newEntry.task || !newEntry.duration || !newEntry.worker) return;

    const entry: TimeEntry = {
      id: Date.now().toString(),
      stage: newEntry.stage,
      task: newEntry.task,
      duration: parseFloat(newEntry.duration),
      worker: newEntry.worker,
      hourlyRate: parseFloat(newEntry.hourlyRate),
      cost: parseFloat(newEntry.duration) * parseFloat(newEntry.hourlyRate),
      timestamp: new Date().toISOString()
    };

    const updatedEntries = [...timeEntries, entry];
    setTimeEntries(updatedEntries);
    onTimeUpdate(updatedEntries);
    
    setNewEntry({
      stage: "",
      task: "",
      duration: "",
      worker: "",
      hourlyRate: "40"
    });
  };

  const totalCost = timeEntries.reduce((sum, entry) => sum + entry.cost, 0);
  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);

  const getStageColor = (stage: string) => {
    return stages.find(s => s.value === stage)?.color || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
              </div>
              <Clock className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Labor Cost</p>
                <p className="text-2xl font-bold">${totalCost.toFixed(0)}</p>
              </div>
              <Calculator className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rate</p>
                <p className="text-2xl font-bold">${(totalCost / totalHours).toFixed(0)}/hr</p>
              </div>
              <Users className="h-6 w-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Time Entry */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-primary" />
            <span>Log Time Entry</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select value={newEntry.stage} onValueChange={(value) => setNewEntry({...newEntry, stage: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {stages.map(stage => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Task description"
              value={newEntry.task}
              onChange={(e) => setNewEntry({...newEntry, task: e.target.value})}
            />

            <Input
              type="number"
              step="0.5"
              placeholder="Hours"
              value={newEntry.duration}
              onChange={(e) => setNewEntry({...newEntry, duration: e.target.value})}
            />

            <Select value={newEntry.worker} onValueChange={(value) => setNewEntry({...newEntry, worker: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select worker" />
              </SelectTrigger>
              <SelectContent>
                {workers.map(worker => (
                  <SelectItem key={worker} value={worker}>
                    {worker}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={addTimeEntry} className="bg-primary hover:bg-primary/90">
              Add Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries List */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="p-4 bg-muted/20 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getStageColor(entry.stage)} text-white`}>
                      {stages.find(s => s.value === entry.stage)?.label}
                    </Badge>
                    <div>
                      <p className="font-medium">{entry.task}</p>
                      <p className="text-sm text-muted-foreground">{entry.worker}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{entry.duration}h × ${entry.hourlyRate}/hr</p>
                    <p className="text-sm text-primary font-semibold">${entry.cost.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
