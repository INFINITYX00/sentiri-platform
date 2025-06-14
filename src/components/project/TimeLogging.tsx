
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Plus, User } from "lucide-react";
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
    hourly_rate: "25"
  });

  const handleAddEntry = async () => {
    if (!newEntry.stage || !newEntry.task || !newEntry.duration || !newEntry.worker) {
      return;
    }

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
        hourly_rate: "25"
      });
      
      if (onTimeUpdate) {
        onTimeUpdate(timeEntries);
      }
    }
  };

  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalCost = timeEntries.reduce((sum, entry) => sum + entry.cost, 0);

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
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
              </div>
              <div className="text-primary">$</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entries</p>
                <p className="text-2xl font-bold">{timeEntries.length}</p>
              </div>
              <User className="h-6 w-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Time Entry */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Log Time Entry</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select value={newEntry.stage} onValueChange={(value) => setNewEntry({...newEntry, stage: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="preparation">Preparation</SelectItem>
                <SelectItem value="cutting">Cutting</SelectItem>
                <SelectItem value="assembly">Assembly</SelectItem>
                <SelectItem value="finishing">Finishing</SelectItem>
                <SelectItem value="quality-check">Quality Check</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Task description"
              value={newEntry.task}
              onChange={(e) => setNewEntry({...newEntry, task: e.target.value})}
            />

            <Input
              type="number"
              placeholder="Hours"
              value={newEntry.duration}
              onChange={(e) => setNewEntry({...newEntry, duration: e.target.value})}
            />

            <Input
              placeholder="Worker name"
              value={newEntry.worker}
              onChange={(e) => setNewEntry({...newEntry, worker: e.target.value})}
            />

            <Button onClick={handleAddEntry} className="bg-primary hover:bg-primary/90">
              Add Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries Table */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="capitalize">{entry.stage}</TableCell>
                  <TableCell>{entry.task}</TableCell>
                  <TableCell>{entry.worker}</TableCell>
                  <TableCell>{entry.duration}h</TableCell>
                  <TableCell>${entry.hourly_rate}/h</TableCell>
                  <TableCell>${entry.cost.toFixed(2)}</TableCell>
                  <TableCell>{new Date(entry.timestamp).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
