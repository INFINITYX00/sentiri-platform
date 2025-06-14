
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Users, Calculator } from "lucide-react";
import { useTimeEntries } from "@/hooks/useTimeEntries";

interface TimeLoggingProps {
  projectId: string;
  onTimeUpdate?: (entries: any[]) => void;
}

export function TimeLogging({ projectId, onTimeUpdate }: TimeLoggingProps) {
  const { timeEntries, loading, addTimeEntry } = useTimeEntries(projectId);

  const [newEntry, setNewEntry] = useState({
    stage: "",
    task: "",
    duration: "",
    worker: "",
    hourly_rate: "40"
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

  const handleAddTimeEntry = async () => {
    if (!newEntry.stage || !newEntry.task || !newEntry.duration || !newEntry.worker) return;

    const duration = parseFloat(newEntry.duration);
    const hourlyRate = parseFloat(newEntry.hourly_rate);
    const cost = duration * hourlyRate;

    const entryData = {
      project_id: projectId,
      stage: newEntry.stage,
      task: newEntry.task,
      duration,
      worker: newEntry.worker,
      hourly_rate: hourlyRate,
      cost,
      timestamp: new Date().toISOString()
    };

    const result = await addTimeEntry(entryData);
    
    if (result) {
      setNewEntry({
        stage: "",
        task: "",
        duration: "",
        worker: "",
        hourly_rate: "40"
      });

      if (onTimeUpdate) {
        onTimeUpdate(timeEntries);
      }
    }
  };

  const totalCost = timeEntries.reduce((sum, entry) => sum + entry.cost, 0);
  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);

  const getStageColor = (stage: string) => {
    return stages.find(s => s.value === stage)?.color || "bg-gray-500";
  };

  if (loading) {
    return <div>Loading time entries...</div>;
  }

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
                <p className="text-2xl font-bold">${totalHours > 0 ? (totalCost / totalHours).toFixed(0) : 0}/hr</p>
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

            <Button onClick={handleAddTimeEntry} className="bg-primary hover:bg-primary/90">
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
                    <p className="font-medium">{entry.duration}h × ${entry.hourly_rate}/hr</p>
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
