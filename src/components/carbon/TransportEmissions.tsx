
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, PlusCircle, MapPin, AlertCircle } from "lucide-react";
import { useTransportRoutes } from "@/hooks/useTransportRoutes";

const transportEmissionFactors = {
  "electric-van": 0.02, // kg CO2e per km
  "diesel-van": 0.15,
  "diesel-truck": 0.85,
  "cargo-ship": 0.015, // per km per ton
  "cargo-plane": 0.6,
};

export function TransportEmissions() {
  const { routes, loading, addRoute } = useTransportRoutes();
  
  const [newRoute, setNewRoute] = useState({
    origin: "",
    destination: "",
    distance: "",
    transport_type: "diesel-van",
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddRoute = async () => {
    if (!newRoute.origin || !newRoute.destination || !newRoute.distance) {
      return;
    }

    const distance = parseFloat(newRoute.distance);
    const emissionFactor = transportEmissionFactors[newRoute.transport_type as keyof typeof transportEmissionFactors];
    const carbon_impact = distance * emissionFactor;

    const routeData = {
      origin: newRoute.origin,
      destination: newRoute.destination,
      distance,
      transport_type: newRoute.transport_type,
      carbon_impact,
      date: newRoute.date
    };

    const result = await addRoute(routeData);
    
    if (result) {
      setNewRoute({
        origin: "",
        destination: "",
        distance: "",
        transport_type: "diesel-van",
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const totalEmissions = routes.reduce((sum, route) => sum + route.carbon_impact, 0);
  const averagePerRoute = routes.length > 0 ? totalEmissions / routes.length : 0;

  const getTransportTypeLabel = (type: string) => {
    switch(type) {
      case "electric-van": return "Electric Van";
      case "diesel-van": return "Diesel Van";
      case "diesel-truck": return "Diesel Truck";
      case "cargo-ship": return "Cargo Ship";
      case "cargo-plane": return "Cargo Plane";
      default: return type;
    }
  };

  const getTransportTypeColor = (type: string) => {
    switch(type) {
      case "electric-van": return "bg-green-500";
      case "diesel-van": return "bg-yellow-500";
      case "diesel-truck": return "bg-orange-500";
      case "cargo-ship": return "bg-blue-500";
      case "cargo-plane": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return <div>Loading transport emissions data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Routes</p>
                <p className="text-2xl font-bold">{routes.length}</p>
              </div>
              <Truck className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Emissions</p>
                <p className="text-2xl font-bold">{totalEmissions.toFixed(2)} kg CO₂e</p>
              </div>
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg per Route</p>
                <p className="text-2xl font-bold">{averagePerRoute.toFixed(2)} kg CO₂e</p>
              </div>
              <MapPin className="h-6 w-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Route */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            <span>Add Transport Route</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Origin"
              value={newRoute.origin}
              onChange={(e) => setNewRoute({...newRoute, origin: e.target.value})}
            />

            <Input
              placeholder="Destination"
              value={newRoute.destination}
              onChange={(e) => setNewRoute({...newRoute, destination: e.target.value})}
            />

            <Input
              type="number"
              placeholder="Distance (km)"
              value={newRoute.distance}
              onChange={(e) => setNewRoute({...newRoute, distance: e.target.value})}
            />

            <Select 
              value={newRoute.transport_type} 
              onValueChange={(value) => setNewRoute({...newRoute, transport_type: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Transport Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electric-van">Electric Van</SelectItem>
                <SelectItem value="diesel-van">Diesel Van</SelectItem>
                <SelectItem value="diesel-truck">Diesel Truck</SelectItem>
                <SelectItem value="cargo-ship">Cargo Ship</SelectItem>
                <SelectItem value="cargo-plane">Cargo Plane</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleAddRoute} className="bg-primary hover:bg-primary/90">
              Add Route
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Routes Table */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle>Transport Routes & Emissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Transport Type</TableHead>
                <TableHead>Carbon Impact</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>{route.origin}</TableCell>
                  <TableCell>{route.destination}</TableCell>
                  <TableCell>{route.distance} km</TableCell>
                  <TableCell>
                    <Badge className={`${getTransportTypeColor(route.transport_type)} text-white`}>
                      {getTransportTypeLabel(route.transport_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{route.carbon_impact.toFixed(2)} kg CO₂e</TableCell>
                  <TableCell>{route.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
