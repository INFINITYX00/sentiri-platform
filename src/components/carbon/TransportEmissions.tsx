
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, PlusCircle, MapPin, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransportRoute {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  transportType: string;
  carbonImpact: number;
  date: string;
}

const transportEmissionFactors = {
  "electric-van": 0.02, // kg CO2e per km
  "diesel-van": 0.15,
  "diesel-truck": 0.85,
  "cargo-ship": 0.015, // per km per ton
  "cargo-plane": 0.6,
};

export function TransportEmissions() {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<TransportRoute[]>([
    {
      id: "1",
      origin: "Rotterdam Port, Netherlands",
      destination: "Birmingham Workshop, UK",
      distance: 585,
      transportType: "diesel-truck",
      carbonImpact: 497.25, // 585 * 0.85
      date: "2024-05-10"
    },
    {
      id: "2",
      origin: "Birmingham Workshop, UK",
      destination: "London Showroom, UK",
      distance: 163,
      transportType: "electric-van",
      carbonImpact: 3.26, // 163 * 0.02
      date: "2024-05-15"
    }
  ]);

  const [newRoute, setNewRoute] = useState({
    origin: "",
    destination: "",
    distance: "",
    transportType: "diesel-van",
    date: new Date().toISOString().split('T')[0]
  });

  const addRoute = () => {
    if (!newRoute.origin || !newRoute.destination || !newRoute.distance) {
      toast({
        title: "Missing information",
        description: "Please fill in all route details",
        variant: "destructive",
      });
      return;
    }

    const distance = parseFloat(newRoute.distance);
    const emissionFactor = transportEmissionFactors[newRoute.transportType as keyof typeof transportEmissionFactors];
    const carbonImpact = distance * emissionFactor;

    const route: TransportRoute = {
      id: Date.now().toString(),
      origin: newRoute.origin,
      destination: newRoute.destination,
      distance,
      transportType: newRoute.transportType,
      carbonImpact,
      date: newRoute.date
    };

    setRoutes([...routes, route]);
    
    toast({
      title: "Route added",
      description: `Added route with ${carbonImpact.toFixed(2)} kg CO₂e impact`,
    });

    setNewRoute({
      origin: "",
      destination: "",
      distance: "",
      transportType: "diesel-van",
      date: new Date().toISOString().split('T')[0]
    });
  };

  const totalEmissions = routes.reduce((sum, route) => sum + route.carbonImpact, 0);
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
              value={newRoute.transportType} 
              onValueChange={(value) => setNewRoute({...newRoute, transportType: value})}
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

            <Button onClick={addRoute} className="bg-primary hover:bg-primary/90">
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
                    <Badge className={`${getTransportTypeColor(route.transportType)} text-white`}>
                      {getTransportTypeLabel(route.transportType)}
                    </Badge>
                  </TableCell>
                  <TableCell>{route.carbonImpact.toFixed(2)} kg CO₂e</TableCell>
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
