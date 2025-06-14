
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, TrendingUp, CalendarClock, MapPin, Plus } from "lucide-react";
import { useShipments } from "@/hooks/useShipments";

export function ShippingTracker() {
  const { shipments, loading, addShipment, updateShipmentStatus } = useShipments();
  
  const [newShipment, setNewShipment] = useState({
    tracking_number: "",
    destination: "",
    status: "preparing",
    estimated_arrival: "",
    carrier: "",
    items: "",
    carbon_offset: false
  });
  
  const handleAddShipment = async () => {
    if (!newShipment.tracking_number || !newShipment.destination || !newShipment.estimated_arrival) {
      return;
    }
    
    const shipmentData = {
      tracking_number: newShipment.tracking_number,
      destination: newShipment.destination,
      status: newShipment.status,
      estimated_arrival: newShipment.estimated_arrival,
      actual_arrival: null,
      carrier: newShipment.carrier,
      items: newShipment.items.split(',').map(item => item.trim()),
      carbon_offset: newShipment.carbon_offset
    };
    
    const result = await addShipment(shipmentData);
    
    if (result) {
      setNewShipment({
        tracking_number: "",
        destination: "",
        status: "preparing",
        estimated_arrival: "",
        carrier: "",
        items: "",
        carbon_offset: false
      });
    }
  };
  
  const handleUpdateStatus = async (id: string, status: string) => {
    await updateShipmentStatus(id, status);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'preparing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Preparing</Badge>;
      case 'in-transit':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">In Transit</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const inTransitCount = shipments.filter(s => s.status === 'in-transit').length;
  const deliveredCount = shipments.filter(s => s.status === 'delivered').length;
  const offsetPercentage = shipments.length > 0 
    ? Math.round((shipments.filter(s => s.carbon_offset).length / shipments.length) * 100)
    : 0;

  if (loading) {
    return <div>Loading shipments data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Shipments</p>
                <p className="text-2xl font-bold">{inTransitCount}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{deliveredCount}</p>
              </div>
              <Package className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Carbon Offset</p>
                <p className="text-2xl font-bold">{offsetPercentage}%</p>
              </div>
              <div className="text-primary">CO₂</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Shipment */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Add New Shipment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Tracking Number"
              value={newShipment.tracking_number}
              onChange={(e) => setNewShipment({...newShipment, tracking_number: e.target.value})}
            />
            
            <Input
              placeholder="Destination"
              value={newShipment.destination}
              onChange={(e) => setNewShipment({...newShipment, destination: e.target.value})}
            />
            
            <Select 
              value={newShipment.status} 
              onValueChange={(value) => setNewShipment({...newShipment, status: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="date"
              placeholder="Estimated Arrival"
              value={newShipment.estimated_arrival}
              onChange={(e) => setNewShipment({...newShipment, estimated_arrival: e.target.value})}
            />
            
            <Input
              placeholder="Carrier"
              value={newShipment.carrier}
              onChange={(e) => setNewShipment({...newShipment, carrier: e.target.value})}
            />
            
            <Input
              placeholder="Items (comma separated)"
              value={newShipment.items}
              onChange={(e) => setNewShipment({...newShipment, items: e.target.value})}
            />
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="carbonOffset"
                checked={newShipment.carbon_offset}
                onChange={(e) => setNewShipment({...newShipment, carbon_offset: e.target.checked})}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="carbonOffset" className="text-sm text-gray-700">Carbon Offset</label>
            </div>
            
            <Button onClick={handleAddShipment} className="bg-primary hover:bg-primary/90">
              Add Shipment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle>Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking #</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Carbon</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-medium">{shipment.tracking_number}</TableCell>
                  <TableCell>{shipment.destination}</TableCell>
                  <TableCell>{shipment.carrier}</TableCell>
                  <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                  <TableCell>{shipment.actual_arrival || shipment.estimated_arrival}</TableCell>
                  <TableCell><span className="text-xs">{shipment.items.join(', ')}</span></TableCell>
                  <TableCell>
                    {shipment.carbon_offset ? 
                      <Badge className="bg-green-100 text-green-800 border-green-300">Offset</Badge> : 
                      <Badge variant="outline">Not Offset</Badge>
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {shipment.status !== 'preparing' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleUpdateStatus(shipment.id, 'preparing')}
                          className="h-7 px-2 text-xs"
                        >
                          Set Preparing
                        </Button>
                      )}
                      
                      {shipment.status !== 'in-transit' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleUpdateStatus(shipment.id, 'in-transit')}
                          className="h-7 px-2 text-xs"
                        >
                          Set In Transit
                        </Button>
                      )}
                      
                      {shipment.status !== 'delivered' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleUpdateStatus(shipment.id, 'delivered')}
                          className="h-7 px-2 text-xs"
                        >
                          Set Delivered
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
