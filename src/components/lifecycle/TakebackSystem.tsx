
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Package, Recycle, Calendar, DollarSign, Plus } from "lucide-react";
import { useTakebackItems } from "@/hooks/useTakebackItems";

export function TakebackSystem() {
  const { items, loading, addItem, updateItemStatus } = useTakebackItems();
  
  const [newItem, setNewItem] = useState({
    product_name: "",
    serial_number: "",
    customer_name: "",
    request_date: new Date().toISOString().split('T')[0],
    status: "requested",
    scheduled_date: "",
    assessment_notes: "",
    recovery_value: "0",
    carbon_saved: "0"
  });

  const handleAddItem = async () => {
    if (!newItem.product_name || !newItem.serial_number || !newItem.customer_name) {
      return;
    }

    const itemData = {
      product_name: newItem.product_name,
      serial_number: newItem.serial_number,
      customer_name: newItem.customer_name,
      request_date: newItem.request_date,
      status: newItem.status,
      scheduled_date: newItem.scheduled_date || null,
      assessment_notes: newItem.assessment_notes || null,
      recovery_value: parseFloat(newItem.recovery_value) || 0,
      carbon_saved: parseFloat(newItem.carbon_saved) || 0
    };

    const result = await addItem(itemData);
    
    if (result) {
      setNewItem({
        product_name: "",
        serial_number: "",
        customer_name: "",
        request_date: new Date().toISOString().split('T')[0],
        status: "requested",
        scheduled_date: "",
        assessment_notes: "",
        recovery_value: "0",
        carbon_saved: "0"
      });
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    let scheduledDate;
    if (status === 'scheduled') {
      scheduledDate = new Date().toISOString().split('T')[0];
    }
    await updateItemStatus(id, status, scheduledDate);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'requested':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Requested</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Scheduled</Badge>;
      case 'collected':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">Collected</Badge>;
      case 'processed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Processed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const requestedCount = items.filter(item => item.status === 'requested').length;
  const totalRecoveryValue = items.reduce((sum, item) => sum + item.recovery_value, 0);
  const totalCarbonSaved = items.reduce((sum, item) => sum + item.carbon_saved, 0);

  if (loading) {
    return <div>Loading takeback system data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{requestedCount}</p>
              </div>
              <Package className="h-6 w-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{items.length}</p>
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
                <p className="text-2xl font-bold">${totalRecoveryValue.toFixed(0)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Carbon Saved</p>
                <p className="text-2xl font-bold">{totalCarbonSaved.toFixed(1)} kg</p>
              </div>
              <div className="text-primary">CO₂</div>
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
              value={newItem.product_name}
              onChange={(e) => setNewItem({...newItem, product_name: e.target.value})}
            />
            
            <Input
              placeholder="Serial Number"
              value={newItem.serial_number}
              onChange={(e) => setNewItem({...newItem, serial_number: e.target.value})}
            />
            
            <Input
              placeholder="Customer Name"
              value={newItem.customer_name}
              onChange={(e) => setNewItem({...newItem, customer_name: e.target.value})}
            />
            
            <Input
              type="date"
              value={newItem.request_date}
              onChange={(e) => setNewItem({...newItem, request_date: e.target.value})}
            />
            
            <Input
              type="number"
              placeholder="Recovery Value ($)"
              value={newItem.recovery_value}
              onChange={(e) => setNewItem({...newItem, recovery_value: e.target.value})}
            />
            
            <Input
              type="number"
              placeholder="Carbon Saved (kg)"
              value={newItem.carbon_saved}
              onChange={(e) => setNewItem({...newItem, carbon_saved: e.target.value})}
            />
            
            <div className="md:col-span-2">
              <Textarea
                placeholder="Assessment Notes"
                value={newItem.assessment_notes}
                onChange={(e) => setNewItem({...newItem, assessment_notes: e.target.value})}
              />
            </div>
            
            <Button onClick={handleAddItem} className="bg-primary hover:bg-primary/90 md:col-span-2">
              Add Takeback Request
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Takeback Items Table */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle>Takeback Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Serial #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Recovery Value</TableHead>
                <TableHead>Carbon Saved</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product_name}</TableCell>
                  <TableCell>{item.serial_number}</TableCell>
                  <TableCell>{item.customer_name}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{item.request_date}</TableCell>
                  <TableCell>${item.recovery_value.toFixed(2)}</TableCell>
                  <TableCell>{item.carbon_saved.toFixed(1)} kg CO₂</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {item.status === 'requested' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleStatusUpdate(item.id, 'scheduled')}
                          className="h-7 px-2 text-xs"
                        >
                          Schedule
                        </Button>
                      )}
                      
                      {item.status === 'scheduled' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleStatusUpdate(item.id, 'collected')}
                          className="h-7 px-2 text-xs"
                        >
                          Collect
                        </Button>
                      )}
                      
                      {item.status === 'collected' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleStatusUpdate(item.id, 'processed')}
                          className="h-7 px-2 text-xs"
                        >
                          Process
                        </Button>
                      )}
                    </div>
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
