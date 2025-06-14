
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Recycle, Clock, Box, CircleArrowUp, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TakebackItem {
  id: string;
  productName: string;
  serialNumber: string;
  customerName: string;
  requestDate: string;
  status: string;
  scheduledDate: string | null;
  assessmentNotes: string;
  recoveryValue: number;
  carbonSaved: number;
}

export function TakebackSystem() {
  const { toast } = useToast();
  
  const [takebackItems, setTakebackItems] = useState<TakebackItem[]>([
    {
      id: "1",
      productName: "Eco-Chair Series",
      serialNumber: "ECH-2022-0056",
      customerName: "Green Spaces Co",
      requestDate: "2024-06-01",
      status: "assessment",
      scheduledDate: "2024-06-18",
      assessmentNotes: "Minor wear on armrests, upholstery in good condition",
      recoveryValue: 120,
      carbonSaved: 18.5
    },
    {
      id: "2",
      productName: "Sustainable Desk",
      serialNumber: "SDK-2021-0102",
      customerName: "Sustainable Homes",
      requestDate: "2024-05-15",
      status: "processing",
      scheduledDate: "2024-05-30",
      assessmentNotes: "Surface scratches, all hardware intact",
      recoveryValue: 95,
      carbonSaved: 22.3
    },
    {
      id: "3",
      productName: "Modular Shelving Unit",
      serialNumber: "MSU-2023-0034",
      customerName: "EcoOffices",
      requestDate: "2024-06-05",
      status: "reclaimed",
      scheduledDate: "2024-06-10",
      assessmentNotes: "Excellent condition, successfully disassembled for reuse",
      recoveryValue: 180,
      carbonSaved: 34.8
    }
  ]);
  
  const [newTakeback, setNewTakeback] = useState({
    productName: "",
    serialNumber: "",
    customerName: "",
    status: "requested",
    scheduledDate: "",
    assessmentNotes: ""
  });
  
  const addTakeback = () => {
    if (!newTakeback.productName || !newTakeback.serialNumber || !newTakeback.customerName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required takeback details",
        variant: "destructive",
      });
      return;
    }
    
    const recoveryValue = Math.floor(Math.random() * 200) + 50; // Random value between 50-250
    const carbonSaved = +(Math.random() * 40 + 10).toFixed(1); // Random value between 10-50
    
    const takeback: TakebackItem = {
      id: Date.now().toString(),
      productName: newTakeback.productName,
      serialNumber: newTakeback.serialNumber,
      customerName: newTakeback.customerName,
      requestDate: new Date().toISOString().split('T')[0],
      status: newTakeback.status,
      scheduledDate: newTakeback.scheduledDate || null,
      assessmentNotes: newTakeback.assessmentNotes,
      recoveryValue,
      carbonSaved
    };
    
    setTakebackItems([...takebackItems, takeback]);
    
    toast({
      title: "Takeback request added",
      description: `Product: ${newTakeback.productName} from ${newTakeback.customerName}`,
    });
    
    setNewTakeback({
      productName: "",
      serialNumber: "",
      customerName: "",
      status: "requested",
      scheduledDate: "",
      assessmentNotes: ""
    });
  };
  
  const updateStatus = (id: string, status: string) => {
    setTakebackItems(takebackItems.map(item => {
      if (item.id === id) {
        return { ...item, status };
      }
      return item;
    }));
    
    toast({
      title: "Status updated",
      description: `Takeback status changed to: ${status}`,
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'requested':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Requested</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Scheduled</Badge>;
      case 'assessment':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Assessment</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">Processing</Badge>;
      case 'reclaimed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Reclaimed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalItems = takebackItems.length;
  const totalCarbon = takebackItems.reduce((sum, item) => sum + item.carbonSaved, 0);
  const totalValue = takebackItems.reduce((sum, item) => sum + item.recoveryValue, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Takebacks</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <Box className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Carbon Saved</p>
                <p className="text-2xl font-bold">{totalCarbon.toFixed(1)} kg CO₂e</p>
              </div>
              <Recycle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recovery Value</p>
                <p className="text-2xl font-bold">£{totalValue}</p>
              </div>
              <CircleArrowUp className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Takeback Request */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>New Takeback Request</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Product Name"
              value={newTakeback.productName}
              onChange={(e) => setNewTakeback({...newTakeback, productName: e.target.value})}
            />
            
            <Input
              placeholder="Serial Number"
              value={newTakeback.serialNumber}
              onChange={(e) => setNewTakeback({...newTakeback, serialNumber: e.target.value})}
            />
            
            <Input
              placeholder="Customer Name"
              value={newTakeback.customerName}
              onChange={(e) => setNewTakeback({...newTakeback, customerName: e.target.value})}
            />
            
            <Select 
              value={newTakeback.status} 
              onValueChange={(value) => setNewTakeback({...newTakeback, status: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="reclaimed">Reclaimed</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="date"
              placeholder="Scheduled Date"
              value={newTakeback.scheduledDate}
              onChange={(e) => setNewTakeback({...newTakeback, scheduledDate: e.target.value})}
            />
            
            <div className="md:col-span-2">
              <Textarea
                placeholder="Assessment Notes"
                value={newTakeback.assessmentNotes}
                onChange={(e) => setNewTakeback({...newTakeback, assessmentNotes: e.target.value})}
                rows={3}
              />
            </div>
            
            <Button onClick={addTakeback} className="bg-primary hover:bg-primary/90">
              Add Takeback Request
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Takeback Table */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle>Takeback Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Serial #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Recovery Value</TableHead>
                <TableHead>Carbon Saved</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {takebackItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell>{item.serialNumber}</TableCell>
                  <TableCell>{item.customerName}</TableCell>
                  <TableCell>{item.requestDate}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{item.scheduledDate || "-"}</TableCell>
                  <TableCell>£{item.recoveryValue}</TableCell>
                  <TableCell>{item.carbonSaved} kg CO₂e</TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={item.status}
                      onValueChange={(value) => updateStatus(item.id, value)}
                    >
                      <SelectTrigger className="h-8 w-[140px]">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="requested">Requested</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="assessment">Assessment</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="reclaimed">Reclaimed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
